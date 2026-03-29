import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, LineChart, Shield, Zap } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[120px]" />

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-card-strong px-6 py-4 flex justify-between items-center rounded-none border-t-0 border-x-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Bot size={20} className="text-dark-900" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent gradient-primary">LedgerMind AI</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 rounded-lg font-medium hover:bg-white/5 transition-colors text-white">Sign In</Link>
          <Link to="/register" className="px-5 py-2 rounded-lg font-bold bg-linear-to-r from-accent-500 to-success text-dark-950 hover:opacity-90 transition-opacity animate-pulse-glow">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 px-6 container mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-20 animate-fade-in">
          <div className="inline-block glass-card px-4 py-1 rounded-full mb-6 border border-accent-500/30">
            <span className="text-sm font-semibold text-accent-500">v2.0 powered by Supabase + OpenAI</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            Your Financial <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-accent-500 to-success">Copilot</span>
          </h1>
          <p className="text-xl text-dark-200 mb-10 max-w-2xl mx-auto">
            Upload statements. Ask questions. Track completely automated insights. 
            LedgerMind transforms your raw financial data into an intelligent narrative.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="px-8 py-4 rounded-xl font-bold text-lg bg-linear-to-r from-accent-500 to-[#00b4d8] text-dark-950 hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] transition-shadow">
              Start Co-Piloting Free
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 pb-20">
          <FeatureCard 
            icon={<Bot className="text-accent-500" size={32} />}
            title="Document Intelligence"
            description="Drag & Drop bank statements (PDFs) and extract categorized transactions via vector search & OpenAI."
          />
          <FeatureCard 
            icon={<LineChart className="text-success" size={32} />}
            title="Deep Analytics"
            description="Live tracking, visual aggregations, and beautiful visualizations of where your money is actually going."
          />
          <FeatureCard 
            icon={<Shield className="text-accent-500" size={32} />}
            title="Bank Grade Vault"
            description="Powered by Supabase's enterprise Row Level Security. Your data remains absolutely isolated."
          />
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="glass-card p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group">
    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-3">{title}</h3>
    <p className="text-dark-200 leading-relaxed">{description}</p>
  </div>
);

export default Landing;
