const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require('../config/supabase');

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
- Help with group expense management

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
  /\b(spend|spent|expense|budget|save|saving|money|income|salary|invest|stock|mutual fund|sip|emi|loan|debt|create|debit)\b/i,
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
  if (FINANCE_PATTERNS.some(p => p.test(text))) return false;
  if (UNRELATED_PATTERNS.some(p => p.test(text))) return true;
  if (text.trim().split(/\s+/).length <= 3) return false;
  return false;
}

function getBuiltInResponse(message, transactions, totalSpent, categories) {
  const lower = message.toLowerCase();
  
  if (/^(hi|hello|hey|good morning|good evening|what's up|yo|hola)/i.test(lower)) {
    return `👋 Hello! I'm **LedgerMind AI**, your personal financial copilot.
    
Here's what I can help you with:
• 📊 **Analyze your spending** — "How much did I spend this month?"
• 💰 **Budget advice** — "How can I save more money?"
• 📝 **Add expenses** — "Spent ₹500 on groceries today"
• 🎯 **Financial tips** — "What's the 50/30/20 rule?"

${transactions.length > 0 ? `You have **${transactions.length}** recent transactions totaling **₹${totalSpent.toFixed(2)}**. Ask me anything about them!` : 'Start by adding some expenses and I\'ll give you personalized insights!'}`;
  }

  // Savings advice
  if (/save|saving|reduce|cut.*cost|how.*less|reduce.*spend|budget.*tip/i.test(lower)) {
    return `💰 **Smart Savings Tips for You**
    
${transactions.length > 0 ? `Based on your tracked spending:` : '**General financial advice:**'}
• **50/30/20 Rule** — Allocate 50% to needs, 30% to wants, 20% to savings
• **Track daily** — People who track expenses save **20% more** on average
• **Automate savings** — Set up automatic transfers on payday
• **Cancel unused subscriptions** — Don't pay for what you don't use
• **24-hour rule** — Wait before any non-essential purchase over ₹1,000`;
  }

  return `I'm **LedgerMind AI**, your personal finance assistant! 🤖 I can analyze your spending, help you budget, and provide financial insights. Try asking about your spending categories or how to save more!`;
}

/**
 * Generates a conversational response to a user query using Gemini (with built-in fallback)
 */
const generateAIResponse = async (message, userId) => {
  if (isNegativeMessage(message)) {
    return "⚠️ I'm here to help you with your finances, not for inappropriate conversations. Let's keep things professional! Ask me about your spending, budgets, or financial goals.";
  }

  if (isUnrelatedMessage(message)) {
    return "🚫 This question is not related to personal finance or LedgerMind. I'm your AI financial copilot — I can help you with spending analysis, budgeting, savings tips, and financial planning. Try asking me something about your finances!";
  }

  // Fetch recent transaction context from Supabase
  let transactions = [];
  let totalSpent = 0;
  let categories = {};

  try {
    const { data: expenses, error } = await supabase
      .from('lm_expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(50);

    if (error) throw error;
    transactions = expenses;

    totalSpent = transactions
      .filter(t => t.type === 'expense' || !t.type)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    transactions.forEach(t => {
      if (t.type === 'expense' || !t.type) {
        categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount);
      }
    });
  } catch (err) {
    console.error('Error fetching transactions for AI:', err.message);
  }

  // Gemini API
  if (genAI) {
    try {
      const context = transactions.length > 0
        ? `Recent Transactions (${transactions.length} total, ₹${totalSpent.toFixed(2)} spent):\n${transactions.slice(0, 20).map(t => 
    `  ${new Date(t.date).toLocaleDateString()}: ${t.description} - ₹${t.amount} (${t.category})`
  ).join('\n')}\n\nCategory Breakdown:\n${Object.entries(categories).map(([cat, amt]) => `  ${cat}: ₹${amt.toFixed(2)}`).join('\n')}`
        : 'No transactions recorded yet.';

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const chat = model.startChat({
          history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }, { role: "model", parts: [{ text: "Understood! I'm ready to help." }] }]
      });

      const prompt = `User's Financial Context:\n${context}\n\nUser's Question: ${message}`;
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini AI Error (falling back):', error.message);
    }
  }

  return getBuiltInResponse(message, transactions, totalSpent, categories);
};

/**
 * Generates insights for dashboard
 */
const generateInsights = async (userId) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: transactions, error } = await supabase
       .from('lm_expenses')
       .select('*')
       .eq('user_id', userId)
       .gte('date', startOfMonth);

    if (error || !transactions || transactions.length < 3) {
      return [
        { type: 'info', title: 'Welcome to LedgerMind', message: 'Add more transactions to get AI insights.', icon: '👋' },
        { type: 'saving', title: 'Start Tracking', message: 'Add expenses via AI Chat manually.', icon: '💡' }
      ];
    }

    const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const categories = {};
    transactions.forEach(t => { categories[t.category] = (categories[t.category] || 0) + parseFloat(t.amount); });

    if (genAI) {
      try {
        const context = transactions.map(t => `${new Date(t.date).toLocaleDateString()}: ${t.description} - ₹${t.amount} (${t.category})`).join('\n');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Analyze these transactions and provide exactly 3 actionable financial insights. Return ONLY a JSON array of objects with fields: type, title, message, icon. \n\nTotal spent: ₹${totalSpent.toFixed(2)}\nTransactions:\n${context}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(text).insights || JSON.parse(text);
      } catch (e) {
          console.error('Insights Gemini Error:', e.message);
      }
    }

    // Built-in fallback
    const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    return [
       { type: 'spending', title: `${topCat[0]} leads spending`, message: `Spent ₹${topCat[1].toFixed(0)} on ${topCat[0]} this month.`, icon: '📊' },
       { type: 'budget', title: 'Monthly tracker', message: `Total: ₹${totalSpent.toFixed(0)}. Keep on tracking!`, icon: '💰' },
       { type: 'saving', title: 'Savings opportunity', message: `Try the 50/30/20 rule to plan your future.`, icon: '🎯' }
    ];
  } catch (error) {
    console.error('Insight Gen Error:', error.message);
    return [];
  }
};

module.exports = { generateAIResponse, generateInsights };
