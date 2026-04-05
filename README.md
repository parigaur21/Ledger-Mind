# LedgerMind – AI Financial Copilot 🤖💰

A full-stack SaaS web application for AI-powered expense tracking, budgeting, and financial insights.

![Tech Stack](https://img.shields.io/badge/React-18-blue) 
![Node.js](https://img.shields.io/badge/Node.js-Express-green) 
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-blueviolet) 
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-yellow)

## Features
- **User Authentication** – JWT-based signup, login, and protected routes (using Supabase storage)
- **Expense Management** – Full CRUD with categories, search, filter, and pagination
- **AI Chat Assistant** – Natural language expense tracking and financial Q&A (Gemini API)
- **Real-Time Updates** – Socket.io for live dashboard and cross-session sync
- **Budget Tracking** – Per-category monthly budgets with 80%/exceeded alerts
- **Analytics Dashboard** – Monthly trends, category breakdown, weekly comparisons
- **Group Splitting** – Create groups, add shared expenses, and auto-calculate "who owes who"
- **Financial Insights Engine** – AI-generated spending analysis and savings tips
- **AI Statement Upload** – Upload bank statements (PDF/TXT) for automated expense extraction

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS v4, Recharts |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Real-time | Socket.io |
| AI | Google Gemini API + GPT-4o-mini (Statement Parser) |
| Auth | JWT (jsonwebtoken + bcryptjs) |

## Project Structure

```
LedgerMind/
├── backend/
│   ├── config/          # Supabase client setup
│   ├── controllers/     # Supabase-based handlers
│   ├── middleware/      # Auth & error handling
│   ├── routes/          # API route definitions
│   ├── services/        # AI service (Gemini) & Parser
│   ├── sockets/         # Socket.io handler
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # Layout, reusable UI
│       ├── context/     # Auth & App state
│       ├── pages/       # All page components
│       └── services/    # API & socket clients
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase Project (URL and Anon key)
- Gemini API key (optional, fallback responses work)
- OpenAI API key (for AI Statement Parser)

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
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_key
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
| POST | `/api/groups` | Create group |
| POST | `/api/groups/join` | Join group via invite code |
| GET | `/api/groups/:id` | Get group details & balances |
| POST | `/api/groups/:id/expenses` | Add shared expense with splits |
| POST | `/api/statement/upload` | Upload & extract PDF statement |

## License

MIT
"# Ledger-Mind"
