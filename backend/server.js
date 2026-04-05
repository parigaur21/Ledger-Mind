require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./sockets/socketHandler');
const connectDB = require('./config/db');

// Routes
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const statementRoutes = require('./routes/statementRoutes');

const app = express();
const server = http.createServer(app);

// ✅ Connect DB
connectDB();

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);
setupSocket(io);

// ✅ Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ✅ ROOT ROUTE (FIXES YOUR ERROR)
app.get('/', (req, res) => {
  res.json({
    message: "LedgerMind API 🚀",
    status: "Live",
    endpoints: [
      "/api/health",
      "/api/auth",
      "/api/transactions",
      "/api/analytics",
      "/api/budgets",
      "/api/chat",
      "/api/groups",
      "/api/expenses",
      "/api/statement"
    ]
  });
});

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ✅ API Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/statement', statementRoutes);

// ❌ 404 handler (optional but good)
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found ❌"
  });
});

// ✅ Error handler
app.use(errorHandler);

// ✅ PORT (Render compatible)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 LedgerMind server running on port ${PORT}`);
});

module.exports = { app, server };