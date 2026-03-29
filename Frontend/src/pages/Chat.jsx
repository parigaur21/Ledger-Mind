import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import {
  Send, Bot, Trash2, Sparkles, MoreVertical, FileText, PlusCircle, Target
} from 'lucide-react';

const QUICK_ACTIONS = [
  { icon: FileText, label: 'Show reports', message: 'Show me a summary of my spending this month' },
  { icon: PlusCircle, label: 'Add expense', message: 'Add ₹50 for groceries today' },
  { icon: Target, label: 'Savings goal', message: 'How can I reduce my spending?' }
];

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await chatAPI.getHistory();
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('chat:message', (msg) => {
        setMessages(prev => {
          const exists = prev.some(m => m.createdAt === msg.createdAt && m.role === msg.role);
          if (exists) return prev;
          return [...prev, msg];
        });
        setLoading(false);
      });
      return () => socket.off('chat:message');
    }
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim(), createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(text.trim());
      setMessages(prev => [...prev, res.data.message]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearHistory = async () => {
    try {
      await chatAPI.clearHistory();
      setMessages([]);
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\n/g, '<br/>')
      .replace(/• /g, '<br/>• ');
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex animate-fade-in">
      <div className="flex-1 flex flex-col glass-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-600/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">FinAI Copilot</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-dark-300">Always Active</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-600/50 transition-all"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 glass-card-strong py-1 shadow-xl z-10 animate-fade-in">
                <button
                  onClick={clearHistory}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-dark-600/50 transition-colors"
                >
                  <Trash2 size={15} />
                  Clear History
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {historyLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 loading-skeleton" style={{ width: i % 2 === 0 ? '70%' : '60%', marginLeft: i % 2 === 0 ? 'auto' : 0 }} />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
                <Sparkles size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hello {user?.name?.split(' ')[0]}!</h3>
              <p className="text-dark-300 text-sm max-w-sm mb-6">
                I'm your AI financial copilot. Ask me about your spending, add expenses, or get personalized financial advice.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.message)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700/50 border border-dark-600/50 text-sm text-dark-200 hover:text-white hover:border-primary-500/30 transition-all"
                  >
                    <action.icon size={15} className="text-primary-400" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <span className="text-xs text-dark-500 px-3 py-1 rounded-full bg-dark-700/30">Today</span>
              </div>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 mt-1 shadow-md shadow-primary-500/20">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'gradient-primary text-white rounded-br-md shadow-lg shadow-primary-500/20'
                        : 'bg-dark-700/60 text-dark-100 border border-dark-600/30 rounded-bl-md'
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    {msg.metadata?.action === 'expense_added' && (
                      <div className="mt-2 pt-2 border-t border-dark-500/20">
                        <span className="text-xs opacity-70">✅ Expense saved automatically</span>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs font-bold text-dark-900">{user?.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-md shadow-primary-500/20">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-dark-700/60 border border-dark-600/30 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-dark-600/30">
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.message)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700/50 border border-dark-600/50 text-xs text-dark-300 hover:text-white hover:border-primary-500/30 transition-all whitespace-nowrap shrink-0"
                >
                  <action.icon size={13} className="text-primary-400" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-dark-700/50 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-30 shadow-lg shadow-primary-500/20"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-center text-[10px] text-dark-500 mt-2">FinAI can make mistakes. Verify important info.</p>
        </div>
      </div>
    </div>
  );
}
