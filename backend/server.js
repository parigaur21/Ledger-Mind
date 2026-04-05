require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
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

// ✅ Socket.IO
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

app.set('io', io);
setupSocket(io);

// ✅ Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// ✅ Health route (keep for testing)
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

// ✅ Serve frontend (Vite build)
const clientPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(clientPath));

// ✅ React fallback (IMPORTANT)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// ✅ Error handler (keep LAST)
app.use(errorHandler);

// ✅ PORT
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 LedgerMind running on port ${PORT}`);
});