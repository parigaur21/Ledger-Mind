const Expense = require('../models/Expense');
const ChatMessage = require('../models/ChatMessage');
const { generateAIResponse, generateInsights } = require('../services/aiService');
const { parseExpenseFromText, isAddExpenseIntent, isQueryIntent } = require('../services/expenseParser');

exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    await ChatMessage.create({ user: userId, role: 'user', content: message });

    let responseText = '';
    let metadata = {};

    if (isAddExpenseIntent(message)) {
      const parsed = parseExpenseFromText(message);
      if (parsed) {
        const expense = await Expense.create({
          user: userId,
          amount: parsed.amount,
          category: parsed.category,
          description: parsed.description,
          date: parsed.date,
          source: 'chat'
        });

        const io = req.app.get('io');
        if (io) {
          io.to(userId.toString()).emit('expense:created', expense);
        }

        responseText = `✅ Added expense: **$${parsed.amount.toFixed(2)}** for **${parsed.category}** — "${parsed.description}" on ${parsed.date.toLocaleDateString()}. The expense has been saved to your account.`;
        metadata = { action: 'expense_added', expense: expense.toObject() };
      } else {
        responseText = await generateAIResponse(message, userId);
      }
    } else {
      responseText = await generateAIResponse(message, userId);
    }

    const assistantMessage = await ChatMessage.create({
      user: userId,
      role: 'assistant',
      content: responseText,
      metadata
    });

    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('chat:message', {
        role: 'assistant',
        content: responseText,
        metadata,
        createdAt: assistantMessage.createdAt
      });
    }

    res.json({
      message: {
        role: 'assistant',
        content: responseText,
        metadata,
        createdAt: assistantMessage.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await ChatMessage.find({ user: req.userId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

exports.getInsights = async (req, res, next) => {
  try {
    const insights = await generateInsights(req.userId);
    res.json({ insights });
  } catch (error) {
    next(error);
  }
};

exports.clearHistory = async (req, res, next) => {
  try {
    await ChatMessage.deleteMany({ user: req.userId });
    res.json({ message: 'Chat history cleared.' });
  } catch (error) {
    next(error);
  }
};
