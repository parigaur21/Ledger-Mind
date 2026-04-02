const { GoogleGenerativeAI } = require("@google/generative-ai");
const Expense = require('../models/Expense');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are LedgerMind AI, a smart, friendly, and expert personal finance assistant built into the LedgerMind financial copilot platform.

Your personality:
- You're concise but thorough — no fluff, but always helpful
- You use bold (**text**) for emphasis on key numbers and advice
- You use bullet points (•) for lists
- You're encouraging but honest about bad spending habits
- You understand Indian Rupees (₹) and US Dollars ($)
- When a user has no transactions, still provide general financial advice

Your capabilities:
- Analyze spending patterns and trends
- Provide budgeting advice and savings tips
- Detect potential subscription waste
- Identify impulse spending patterns
- Give category-wise breakdowns
- Suggest ways to reduce expenses
- Answer general personal finance questions

Rules:
- Keep responses under 200 words unless the user asks for detailed analysis
- Always be actionable — give specific advice, not vague platitudes
- If asked about data you don't have, say so honestly and give general advice instead
- Format numbers with currency symbols
- Use line breaks between sections for readability`;

/**
 * Generates a conversational response to a user query using Gemini
 */
const generateAIResponse = async (message, userId) => {
  try {
    // Fetch recent transaction context
    const transactions = await Expense.find({ user: userId })
      .sort({ date: -1 })
      .limit(30);

    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const categories = {};
    transactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const context = transactions.length > 0
      ? `Recent Transactions (${transactions.length} total, ₹${totalSpent.toFixed(2)} spent):
${transactions.map(t => 
  `  ${t.date.toLocaleDateString()}: ${t.description} - ₹${t.amount} (${t.category})`
).join('\n')}

Category Breakdown:
${Object.entries(categories).map(([cat, amt]) => `  ${cat}: ₹${amt.toFixed(2)}`).join('\n')}`
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
          parts: [{ text: "Understood! I'm LedgerMind AI, ready to help with personal finance analysis, budgeting advice, and spending insights. I'll be concise, actionable, and use proper formatting. How can I help?" }],
        },
      ],
    });

    const prompt = `User's Financial Context:
${context}

User's Question: ${message}

Respond helpfully based on the context above. If the user has transactions, reference specific data. If not, give general financial advice.`;

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('AI Response Error:', error.message);
    
    // Fallback: provide a helpful response even if AI fails
    return `I'm having trouble connecting to my AI engine right now, but here are some quick tips:

• **Track every expense** — even small ones add up
• **Follow the 50/30/20 rule** — 50% needs, 30% wants, 20% savings
• **Review subscriptions monthly** — cancel what you don't use

Try asking me again in a moment!`;
  }
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
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `${SYSTEM_PROMPT}

User transactions:
${JSON.stringify(transactions, null, 2)}

Question: ${query}

Give insights, suggestions, and warnings.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Financial AI Error:', error.message);
    return 'Unable to generate financial analysis at this time. Please try again later.';
  }
};

module.exports = { generateAIResponse, generateInsights, financialAI };
