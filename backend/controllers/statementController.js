const fs = require('fs');
const pdf = require('pdf-parse');
const Expense = require('../models/Expense');
const { OpenAI } = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.uploadStatement = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const userId = req.userId;
    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    
    let text = '';
    
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdf(dataBuffer);
      text = data.text;
    } else {
      text = dataBuffer.toString();
    }

    // AI Processing
    const prompt = `
Extract transaction data from the following text (it's a bank statement).
Return ONLY a JSON array of objects with fields: 
- "amount" (number)
- "category" (one of: food, transport, housing, shopping, entertainment, utilities, healthcare, education, travel, salary, freelance, investment, gift, other)
- "description" (string)
- "date" (ISO string or YYYY-MM-DD)
- "type" (expense/income)

Statement Text:
${text.substring(0, 4000)} // Truncate to avoid token limits
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(response.choices[0].message.content);
    const transactions = parsedData.transactions || parsedData;

    if (!Array.isArray(transactions)) {
      throw new Error('Invalid response format from AI');
    }

    // Insert into MongoDB
    const expenses = transactions.map(t => ({
      ...t,
      user: userId,
      source: 'import'
    }));

    await Expense.insertMany(expenses);

    // Cleanup file
    fs.unlinkSync(filePath);

    res.status(201).json({
      message: `Successfully imported ${expenses.length} transactions.`,
      count: expenses.length
    });
  } catch (error) {
    console.error('Statement Upload Error:', error.message);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    next(error);
  }
};
