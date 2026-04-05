const supabase = require('../config/supabase');
const { generateAIResponse, generateInsights } = require('../services/aiService');
const { isAddExpenseIntent, parseExpenseFromText } = require('../services/expenseParser');

exports.sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.userId;

    // 1. Save user message
    await supabase.from('lm_chat_messages').insert([{ user_id: userId, role: 'user', content: message }]);

    let responseText = '';
    let metadata = {};

    if (isAddExpenseIntent(message)) {
      const parsed = parseExpenseFromText(message);
      if (parsed) {
        // 2. Create expense in Supabase
        const { data: expense, error } = await supabase
          .from('lm_expenses')
          .insert([{
            user_id: userId,
            amount: parsed.amount,
            category: parsed.category,
            description: parsed.description,
            date: parsed.date,
            source: 'chat'
          }])
          .select()
          .single();

        const io = req.app.get('io');
        if (io) {
          io.to(userId.toString()).emit('expense:created', expense);
        }

        responseText = `✅ Added expense: **$${parsed.amount.toFixed(2)}** for **${parsed.category}** — "${parsed.description}" on ${parsed.date.toLocaleDateString()}. The expense has been saved to your account.`;
        metadata = { action: 'expense_added', expense };
      } else {
        responseText = await generateAIResponse(message, userId);
      }
    } else {
      responseText = await generateAIResponse(message, userId);
    }

    // 3. Save assistant message
    const { data: assistantMessage, error } = await supabase
      .from('lm_chat_messages')
      .insert([{
        user_id: userId,
        role: 'assistant',
        content: responseText,
        metadata
      }])
      .select()
      .single();

    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('chat:message', {
        role: 'assistant',
        content: responseText,
        metadata,
        createdAt: assistantMessage.created_at
      });
    }

    res.json({
      message: {
        role: 'assistant',
        content: responseText,
        metadata,
        createdAt: assistantMessage.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    const { data: messages, error } = await supabase
      .from('lm_chat_messages')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: true })
      .range(from, to);

    if (error) throw error;
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
    const { error } = await supabase.from('lm_chat_messages').delete().eq('user_id', req.userId);
    if (error) throw error;
    res.json({ message: 'Chat history cleared.' });
  } catch (error) {
    next(error);
  }
};
