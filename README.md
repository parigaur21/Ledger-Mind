# LedgerMind – AI Financial Copilot 🤖💰

A full-stack SaaS web application for AI-powered expense tracking, budgeting, and financial insights.


![Tech Stack](https://img.shields.io/badge/React-18-blue) 
![Node.js](https://img.shields.io/badge/Node.js-Express-green) 
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen) 
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-yellow)


## Features
- **User Authentication** – JWT-based signup, login, and protected routes
- **Expense Management** – Full CRUD with categories, search, filter, and pagination
- **AI Chat Assistant** – Natural language expense tracking and financial Q&A (Gemini API)
- **Real-Time Updates** – Socket.io for live dashboard and cross-session sync
- **Budget Tracking** – Per-category monthly budgets with 80%/exceeded alerts
- **Analytics Dashboard** – Monthly trends, category breakdown, weekly comparisons
- **Financial Insights Engine** – AI-generated spending analysis and savings tips
- **Weekly Reports** – Automated spending summaries with trend insights

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS v4, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| AI | Google Gemini API |
| Auth | JWT (jsonwebtoken + bcryptjs) |

## Project Structure

```
LedgerMind/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth & error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── services/        # AI service & expense parser
│   ├── sockets/         # Socket.io handler
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Layout, reusable UI
│       ├── context/     # Auth context provider
│       ├── pages/       # All page components
│       └── services/    # API & socket clients
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key (optional, fallback responses work without it)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Copy `backend/.env.example` to `backend/.env` and update:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ledgermind
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### 3. Run the Application

```bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| GET | `/api/expenses` | List expenses (with filters) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create/update budget |
| GET | `/api/analytics/dashboard` | Dashboard statistics |
| GET | `/api/analytics/analytics` | Detailed analytics |
| GET | `/api/analytics/weekly-report` | Weekly report |
| POST | `/api/chat/message` | Send chat message |
| GET | `/api/chat/history` | Get chat history |
| GET | `/api/chat/insights` | Get AI insights |

## Chat Commands and Responses

- `"Add 200 for groceries"` – Auto-creates expense
- `"How much did I spend this week?"` – Queries spending
- `"Show my transport expenses"` – Category query
- `"How can I reduce my spending?"` – AI financial advice
- `"What was my biggest expense?"` – Spending analysis

## License

MIT
"# Ledger-Mind" 
