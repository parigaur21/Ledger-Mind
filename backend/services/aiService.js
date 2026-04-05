const { GoogleGenerativeAI } = require("@google/generative-ai");
const Expense = require('../models/Expense');

let genAI;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (e) {
  console.warn('Gemini AI initialization failed:', e.message);
}

const SYSTEM_PROMPT = `You are LedgerMind AI, a smart, friendly, and expert personal finance assistant built into the LedgerMind financial copilot platform.

IMPORTANT RULES — YOU MUST FOLLOW THESE STRICTLY:
1. You ONLY answer questions related to personal finance, budgeting, expenses, savings, investments, financial planning, money management, and the LedgerMind platform.
2. If someone asks a question that is NOT related to finance or money (e.g., politics, sports, movies, coding, news, jokes, weather, general knowledge, etc.), you MUST respond EXACTLY with:
   "🚫 This question is not related to personal finance or LedgerMind. I'm your AI financial copilot — I can help you with spending analysis, budgeting, savings tips, and financial planning. Try asking me something about your finances!"
3. If someone sends negative, abusive, inappropriate, or offensive messages, you MUST respond EXACTLY with:
   "⚠️ I'm here to help you with your finances, not for inappropriate conversations. Let's keep things professional! Ask me about your spending, budgets, or financial goals."
4. NEVER break character. You are ALWAYS a financial AI assistant. You do NOT do anything else.
5. Do NOT answer questions about coding, programming, technology (unless it's fintech), science, history, or any non-financial topic.

Your personality:
- You're concise but thorough — no fluff, but always helpful
- You use bold (**text**) for emphasis on key numbers and advice
- You use bullet points (•) for lists
- You're encouraging but honest about bad spending habits
- You understand Indian Rupees (₹) and US Dollars ($)
- When a user has no transactions, still provide general financial advice

Your capabilities:
- Analyze spending patterns and trends from user data
- Provide budgeting advice and savings tips
- Detect potential subscription waste
- Identify impulse spending patterns
- Give category-wise breakdowns
- Suggest ways to reduce expenses
- Answer general personal finance questions
- Help set and track financial goals
- Explain financial concepts in simple terms

Rules:
- Keep responses under 200 words unless the user asks for detailed analysis
- Always be actionable — give specific advice, not vague platitudes
- If asked about data you don't have, say so honestly and give general advice instead
- Format numbers with currency symbols
- Use line breaks between sections for readability`;

// Keywords that indicate unrelated or negative content
const NEGATIVE_PATTERNS = [
  /\b(fuck|shit|damn|ass|bitch|bastard|stupid|idiot|dumb|hate you|shut up|die|kill)\b/i,
  /\b(suck|crap|trash|garbage|worthless|useless)\b/i
];

const UNRELATED_PATTERNS = [
  /\b(who is the president|capital of|weather|recipe|movie|song|game|sport|cricket|football|basketball)\b/i,
  /\b(write me a (poem|story|essay|code|script|program))\b/i,
  /\b(tell me a joke|sing|dance|play|draw|paint)\b/i,
  /\b(python|javascript|java|html|css|react|node|coding|programming|code)\b/i,
  /\b(who won|election|politics|war|religion|god)\b/i,
  /\b(girlfriend|boyfriend|dating|love life|relationship)\b/i,
  /\b(hack|cheat|illegal|steal|fraud)\b/i
];

const FINANCE_PATTERNS = [
  /\b(spend|spent|expense|budget|save|saving|money|income|salary|invest|stock|mutual fund|sip|emi|loan|debt|credit|debit)\b/i,
  /\b(₹|rs|usd|\$|dollar|rupee|inr)\b/i,
  /\b(financial|finance|bank|account|transaction|payment|bill|cost|price|fee|tax)\b/i,
  /\b(grocery|food|rent|transport|shopping|utility|entertainment|healthcare|education|travel)\b/i,
  /\b(how much|total|breakdown|category|monthly|weekly|daily|this month|last month|this week|annual)\b/i,
  /\b(goal|target|reduce|cut|plan|track|manage|analyze|report|summary|insight|tip|advice)\b/i,
  /\b(crypto|bitcoin|ethereum|portfolio|asset|liability|net worth|wealth|profit|loss|roi)\b/i,
  /\b(insurance|premium|fd|fixed deposit|recurring|ppf|nps|pension|retirement|emergency fund)\b/i,
  /\b(hello|hi|hey|help|thanks|thank you|please|what can you do|who are you)\b/i
];

function isNegativeMessage(text) {
  return NEGATIVE_PATTERNS.some(p => p.test(text));
}

function isUnrelatedMessage(text) {
  // If it matches finance patterns, it's related
  if (FINANCE_PATTERNS.some(p => p.test(text))) return false;
  // If it matches unrelated patterns, reject it
  if (UNRELATED_PATTERNS.some(p => p.test(text))) return true;
  // For very short messages (greetings), allow them
  if (text.trim().split(/\s+/).length <= 3) return false;
  return false;
}

/**
 * Built-in financial AI that works without any external API
 */
function getBuiltInResponse(message, transactions, totalSpent, categories) {
  const lower = message.toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|good morning|good evening|what's up|yo|hola)/i.test(lower)) {
    return `👋 Hello! I'm **LedgerMind AI**, your personal financial copilot.

Here's what I can help you with:
• 📊 **Analyze your spending** — "How much did I spend this month?"
• 💰 **Budget advice** — "How can I save more money?"
• 📝 **Add expenses** — "Spent ₹500 on groceries today"
• 🎯 **Financial tips** — "What's the 50/30/20 rule?"

${transactions.length > 0 ? `You have **${transactions.length}** recent transactions totaling **₹${totalSpent.toFixed(2)}**. Ask me anything about them!` : 'Start by adding some expenses and I\'ll give you personalized insights!'}`;
  }

  // Who are you / what can you do
  if (/who are you|what can you do|what are you|help|your capabilities/i.test(lower)) {
    return `🤖 I'm **LedgerMind AI** — your intelligent financial copilot!

**What I can do:**
• 📊 Analyze your spending patterns and trends
• 💰 Provide personalized budgeting advice
• 🎯 Help you set and track savings goals
• 📉 Identify areas where you can cut costs
• 📝 Add expenses via natural language
• 📋 Generate spending summaries and reports

**Try asking:**
• "How much did I spend on food?"
• "Show me my spending summary"
• "How can I reduce my expenses?"
• "Add ₹200 for coffee today"`;
  }

  // Spending summary / how much spent
  if (/how much.*spend|total.*spend|spending.*summary|show.*summary|my spending|spending report/i.test(lower)) {
    if (transactions.length === 0) {
      return `📊 You haven't recorded any expenses yet!

Start tracking by:
• Typing "Spent ₹500 on groceries" in this chat
• Using the **+ Add Expense** button on the Expenses page
• Uploading a bank statement on the Dashboard

Once you add expenses, I'll give you detailed spending analysis!`;
    }

    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return `📊 **Your Spending Summary**

**Total Spent:** ₹${totalSpent.toFixed(2)} (${transactions.length} transactions)

**Top Categories:**
${topCategories.map(([cat, amt]) => `• **${cat.charAt(0).toUpperCase() + cat.slice(1)}**: ₹${amt.toFixed(2)} (${((amt/totalSpent)*100).toFixed(0)}%)`).join('\n')}

${totalSpent > 10000 ? '⚠️ Your spending is on the higher side. Consider setting budget limits per category.' : '✅ Your spending looks manageable. Keep tracking to maintain control!'}`;
  }

  // Category-specific query
  for (const [cat, amt] of Object.entries(categories)) {
    if (lower.includes(cat)) {
      const catTransactions = transactions.filter(t => t.category === cat);
      return `📊 **${cat.charAt(0).toUpperCase() + cat.slice(1)} Spending**

**Total:** ₹${amt.toFixed(2)} across **${catTransactions.length}** transactions

**Recent ${cat} expenses:**
${catTransactions.slice(0, 5).map(t => `• ₹${t.amount.toFixed(2)} — ${t.description} (${t.date.toLocaleDateString()})`).join('\n')}

${catTransactions.length > 5 ? `...and ${catTransactions.length - 5} more` : ''}

💡 **Tip:** ${cat === 'food' ? 'Try meal prepping to cut dining costs by up to 40%!' : cat === 'shopping' ? 'Use the 24-hour rule — wait a day before impulse purchases.' : cat === 'entertainment' ? 'Check for unused subscriptions you can cancel.' : cat === 'transport' ? 'Consider carpooling or public transit to save on fuel.' : 'Review this category monthly and set a spending limit.'}`;
    }
  }

  // Savings advice
  if (/save|saving|reduce|cut.*cost|how.*less|reduce.*spend|budget.*tip/i.test(lower)) {
    return `💰 **Smart Savings Tips for You**

${transactions.length > 0 ? `Based on your ₹${totalSpent.toFixed(2)} spending:` : '**General financial advice:**'}

• **50/30/20 Rule** — Allocate 50% to needs, 30% to wants, 20% to savings
• **Track daily** — People who track expenses save **20% more** on average
• **Automate savings** — Set up automatic transfers on payday
• **Cancel unused subscriptions** — The average person wastes ₹1,500/month on forgotten subscriptions
• **Use cash for discretionary spending** — It reduces impulse buying by 12-18%
• **Meal prep** — Can save ₹3,000-5,000/month vs eating out
• **24-hour rule** — Wait before any non-essential purchase over ₹1,000

🎯 **Quick Win:** Review your last 5 transactions and identify one you could have avoided!`;
  }

  // Investment / financial planning
  if (/invest|investment|stock|mutual fund|sip|fd|ppf|nps|portfolio|retirement/i.test(lower)) {
    return `📈 **Investment Basics**

**For beginners, consider this allocation:**
• **Emergency Fund** (~6 months expenses) → High-yield savings account
• **SIP in Index Funds** → Low-cost, diversified market exposure
• **PPF / NPS** → Tax-saving + long-term wealth building
• **Fixed Deposits** → Safe, guaranteed returns for short-term goals

**Key Principles:**
• Start early — compound interest is your best friend
• Don't try to time the market — SIPs average out volatility
• Diversify across asset classes
• Review your portfolio quarterly

⚠️ **Disclaimer:** I provide general financial education, not certified investment advice. Consult a SEBI-registered advisor for personalized recommendations.`;
  }

  // 50/30/20 rule
  if (/50.*30.*20|budget.*rule|budgeting.*rule/i.test(lower)) {
    return `📏 **The 50/30/20 Budget Rule**

Split your after-tax income into three buckets:

**50% — Needs (Essential)**
• Rent, utilities, groceries, insurance, EMIs, transport

**30% — Wants (Lifestyle)**
• Dining out, entertainment, shopping, subscriptions, travel

**20% — Savings & Investments**
• Emergency fund, SIPs, FDs, debt repayment above minimums

${transactions.length > 0 ? `\n📊 **Your breakdown:**\nTotal tracked: ₹${totalSpent.toFixed(2)}\nTry categorizing your expenses to see how you compare!` : ''}

💡 Start with this framework and adjust based on your goals!`;
  }

  // Default helpful response for finance-related queries
  if (transactions.length > 0) {
    const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    return `Based on your recent activity, here's a quick overview:

📊 **${transactions.length}** transactions totaling **₹${totalSpent.toFixed(2)}**
📌 Top category: **${topCat ? topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1) : 'N/A'}** (₹${topCat ? topCat[1].toFixed(2) : '0'})

**Try asking me:**
• "How much did I spend on food?"
• "Give me savings tips"
• "Show my spending breakdown"
• "What's the 50/30/20 rule?"

I'm here to help you make smarter financial decisions! 💪`;
  }

  return `I'm **LedgerMind AI**, your personal finance assistant! 🤖

I can help you with:
• 📊 Spending analysis & trends
• 💰 Budgeting & savings advice
• 🎯 Financial goal setting
• 📝 Quick expense tracking

**Get started** by adding some expenses:
• Type "Spent ₹300 on lunch" to add an expense
• Or use the Expenses page to add manually

Once you have transactions, I'll provide **personalized insights** about your spending patterns!`;
}

/**
 * Generates a conversational response to a user query using Gemini (with built-in fallback)
 */
const generateAIResponse = async (message, userId) => {
  // First: check for negative/abusive content
  if (isNegativeMessage(message)) {
    return "⚠️ I'm here to help you with your finances, not for inappropriate conversations. Let's keep things professional! Ask me about your spending, budgets, or financial goals.";
  }

  // Second: check for unrelated topics
  if (isUnrelatedMessage(message)) {
    return "🚫 This question is not related to personal finance or LedgerMind. I'm your AI financial copilot — I can help you with spending analysis, budgeting, savings tips, and financial planning. Try asking me something about your finances!";
  }

  // Fetch recent transaction context
  let transactions = [];
  let totalSpent = 0;
  let categories = {};

  try {
    transactions = await Expense.find({ user: userId })
      .sort({ date: -1 })
      .limit(50);

    totalSpent = transactions
      .filter(t => t.type === 'expense' || !t.type)
      .reduce((sum, t) => sum + t.amount, 0);

    transactions.forEach(t => {
      if (t.type === 'expense' || !t.type) {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
    });
  } catch (err) {
    console.error('Error fetching transactions for AI:', err.message);
  }

  // Try Gemini API first
  if (genAI) {
    try {
      const context = transactions.length > 0
        ? `Recent Transactions (${transactions.length} total, ₹${totalSpent.toFixed(2)} spent):\n${transactions.slice(0, 20).map(t => 
    `  ${t.date.toLocaleDateString()}: ${t.description} - ₹${t.amount} (${t.category})`
  ).join('\n')}\n\nCategory Breakdown:\n${Object.entries(categories).map(([cat, amt]) => `  ${cat}: ₹${amt.toFixed(2)}`).join('\n')}`
        : 'No transactions recorded yet. The user is new.';

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT }],
          },
          {
            role: "model",
            parts: [{ text: "Understood! I'm LedgerMind AI, ready to help with personal finance analysis, budgeting advice, and spending insights. I will ONLY answer finance-related questions and reject anything unrelated or inappropriate. How can I help?" }],
          },
        ],
      });

      const prompt = `User's Financial Context:\n${context}\n\nUser's Question: ${message}\n\nIMPORTANT: If this question is NOT about finance, money, or LedgerMind, respond with the rejection message. Otherwise, respond helpfully based on the context above.`;

      const result = await chat.sendMessage(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI Error (falling back to built-in):', error.message);
    }
  }

  // Fallback: Built-in financial AI
  return getBuiltInResponse(message, transactions, totalSpent, categories);
};

/**
 * Generates high-level insights for the dashboard using Gemini
 */
const generateInsights = async (userId) => {
  try {
    const transactions = await Expense.find({ 
      user: userId,
      date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1) } 
    });

    if (transactions.length < 3) {
      return [
        {
          type: 'info',
          title: 'Welcome to LedgerMind',
          message: 'Add more transactions to get personalized AI insights and spending advice.',
          icon: '👋'
        },
        {
          type: 'saving',
          title: 'Start Tracking',
          message: 'Try adding your daily expenses via the AI Chat — just type "spent ₹200 on groceries".',
          icon: '💡'
        }
      ];
    }

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const categories = {};
    transactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    // Try Gemini
    if (genAI) {
      try {
        const context = transactions.map(t => 
          `${t.date.toLocaleDateString()}: ${t.description} - ₹${t.amount} (${t.category})`
        ).join('\n');

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Analyze these transactions and provide exactly 3 actionable financial insights.
Return ONLY a valid JSON object with an "insights" key containing an array.
Each insight must have: "type" (one of: budget, spending, saving), "title" (short), "message" (1-2 sentences), and "icon" (single emoji).

Total spent: ₹${totalSpent.toFixed(2)}
Transactions:
${context}

Respond with ONLY the JSON object, no markdown, no code blocks.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(text);
        return parsed.insights || parsed;
      } catch (error) {
        console.error('Gemini Insight Error (using built-in):', error.message);
      }
    }

    // Built-in insights fallback
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    const insights = [];

    if (topCategory) {
      insights.push({
        type: 'spending',
        title: `${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)} leads spending`,
        message: `You've spent ₹${topCategory[1].toFixed(0)} on ${topCategory[0]} — that's ${((topCategory[1]/totalSpent)*100).toFixed(0)}% of your total. Consider setting a budget limit.`,
        icon: '📊'
      });
    }

    insights.push({
      type: 'budget',
      title: 'Monthly spending tracker',
      message: `Total spending this period: ₹${totalSpent.toFixed(0)} across ${transactions.length} transactions. ${totalSpent > 10000 ? 'Consider reviewing non-essential purchases.' : 'You\'re tracking well!'}`,
      icon: '💰'
    });

    insights.push({
      type: 'saving',
      title: 'Savings opportunity',
      message: `Try the 50/30/20 rule: allocate 50% to needs, 30% to wants, and 20% to savings for better financial health.`,
      icon: '🎯'
    });

    return insights;
  } catch (error) {
    console.error('Insight Generation Error:', error.message);
    return [
      {
        type: 'info',
        title: 'AI Insights Loading',
        message: 'We\'re processing your financial data. Check back soon for personalized insights.',
        icon: '🔄'
      }
    ];
  }
};

/**
 * Financial AI advisor
 */
const financialAI = async (transactions, query) => {
  // Check for unrelated/negative content
  if (isNegativeMessage(query)) {
    return "⚠️ I'm here to help you with your finances. Let's keep things professional!";
  }
  if (isUnrelatedMessage(query)) {
    return "🚫 This question is not related to personal finance. I can only help with spending analysis, budgeting, and financial planning.";
  }

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `${SYSTEM_PROMPT}\n\nUser transactions:\n${JSON.stringify(transactions, null, 2)}\n\nQuestion: ${query}\n\nGive insights, suggestions, and warnings. If the question is not about finance, reject it.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Financial AI Error:', error.message);
    }
  }

  return 'Based on your transactions, I recommend reviewing your spending categories and setting monthly budget limits. Use the Budget Planner to track your progress!';
};

module.exports = { generateAIResponse, generateInsights, financialAI };
