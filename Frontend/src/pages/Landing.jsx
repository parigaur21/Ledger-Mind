import { useRef, useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Zap,
  Wallet,
  PieChart,
  LineChart,
  Bot,
  ChevronRight,
  Terminal,
  Sun,
  Moon
} from 'lucide-react';

/* ═══════════════════════════════════════════
   REUSABLE ANIMATED COMPONENTS
   ═══════════════════════════════════════════ */
const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   SLEEK MOCK DASHBOARD VISUAL
   ═══════════════════════════════════════════ */
const DashboardGraphic = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.95, 1]);

  return (
    <motion.div 
      ref={ref}
      style={{ opacity, scale }}
      className="relative w-full max-w-lg mx-auto lg:mx-0"
    >
      <div className="rounded-2xl border border-(--border-color) bg-(--card-bg) backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col transition-colors duration-300">
        {/* Mock Topbar */}
        <div className="h-10 border-b border-(--border-color) flex items-center justify-between px-4 bg-(--text-main)/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-(--text-main)/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-(--text-main)/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-(--text-main)/10" />
          </div>
          <span className="text-[9px] text-(--text-muted) font-bold uppercase tracking-[0.2em]">Live Analysis</span>
          <div className="w-10" />
        </div>

        {/* Mock Content: Monthly Burn Style (from reference) */}
        <div className="p-8 space-y-8">
          <div>
            <p className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest mb-2">Monthly Burn</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl lg:text-7xl font-black text-(--text-main) tracking-tighter">₹5,147</span>
              <span className="text-xs font-bold text-error-500 bg-error-500/10 px-2 py-0.5 rounded-md">+₹330</span>
            </div>
            <p className="text-[10px] text-(--text-muted) mt-2 font-medium">across <span className="text-(--text-main)">6 active subscriptions</span></p>
          </div>

          <div className="space-y-4">
            {[
              { name: "Netflix", price: "₹649", color: "bg-red-500" },
              { name: "Spotify", price: "₹119", color: "bg-green-500" },
              { name: "Hotstar", price: "₹299", color: "bg-blue-500" },
              { name: "ChatGPT Plus", price: "₹1,650", color: "bg-emerald-500" }
            ].map((sub, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${sub.color}`} />
                  <span className="text-sm font-semibold text-(--text-main)/80 group-hover:text-(--text-main) transition-colors">{sub.name}</span>
                </div>
                <span className="text-sm font-mono text-(--text-muted)">{sub.price}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-(--border-color) flex items-center justify-between">
            <span className="text-[10px] font-bold text-(--text-muted) uppercase tracking-wider">Total Projected</span>
            <span className="text-lg font-bold text-(--text-main) tracking-tight">₹12,450.00</span>
          </div>
        </div>
      </div>

      {/* AI Insight Pill - Level & Precise Edge Trace */}
      <motion.div 
        animate={{ 
          x: [0, 510, 510, 0, 0], // Precise width of max-w-lg card
          y: [0, 0, 420, 420, 0], // Precise height of the card content
        }}
        transition={{ 
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        // Positioned at the exact top-left corner without any rotation
        className="absolute -left-24 -top-8 z-50 pointer-events-auto"
      >
        <div className="bg-primary-500/95 backdrop-blur-md text-white px-5 py-2.5 rounded-xl flex items-center gap-3 border border-white/20 shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
             <span className="text-[11px] font-black uppercase tracking-wider">AI INSIGHT</span>
             <span className="text-[9px] font-bold text-white/50 uppercase">Precision Scanning</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */
const Landing = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="bg-(--bg-main) text-(--text-main) overflow-x-hidden min-h-screen relative">
      {/* Cinematic Abstract Video Background - High Visibility */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-60">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105"
        >
          <source src="https://assets.codepen.io/3364143/7btrrd.mp4" type="video/mp4" />
        </video>
        {/* Subtle overlay to ensure video is the focus while keeping text readable */}
        <div className="absolute inset-0 bg-(--bg-main)/40 backdrop-blur-[0.5px]" />
      </div>

      {/* Elegant Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 inset-x-0 h-[500px] bg-linear-to-b from-primary-900/10 to-transparent pointer-events-none z-0" />

      {/* ── NAVBAR ── */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 w-full z-100 bg-(--nav-bg) backdrop-blur-xl border-b border-(--border-color)"
      >
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-(--card-bg) border border-(--border-color) flex items-center justify-center group-hover:border-primary-500 transition-colors">
              <Wallet size={20} className="text-primary-500" />
            </div>
            <span className="text-xl font-black tracking-tighter text-(--text-main)">LEDGERMIND</span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="text-sm font-medium text-dark-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="gradient-primary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1 group">
              Get Started <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* NEW SPLIT HERO SECTION */}
      <section className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden border-b border-(--border-color) bg-(--bg-main)">
        {/* Left Side: Content Panel (Split background effect) */}
        <div className="flex-1 px-6 lg:px-16 pt-24 lg:pt-32 flex flex-col justify-start relative z-20 overflow-hidden lg:bg-transparent">
          {/* Subtle light pulse behind text (Left Side) */}
          <div className="absolute top-48 left-0 w-[400px] h-[400px] bg-primary-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto lg:mx-0 text-left"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8 lg:mb-10">
              <div className="h-px w-8 bg-primary-500" />
              <span className="text-[10px] md:text-xs font-black tracking-[0.2em] text-primary-500 uppercase">Personal Finance Intelligence</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="flex flex-col text-6xl md:text-7xl lg:text-[7.5rem] font-black leading-[0.82] lg:leading-[0.78] tracking-tighter uppercase mb-6 lg:mb-8 select-none"
            >
              <span className="text-(--text-main)">Precision.</span>
              <div className="overflow-hidden">
                <span className="text-outline text-(--text-main)/30 block group-hover:text-(--text-main) transition-colors duration-500">Intelligence.</span>
              </div>
              <span className="text-primary-500 text-glow">Finance.</span>
            </motion.h1>

            <motion.div variants={itemVariants} className="max-w-md">
              <p className="text-(--text-muted) text-base md:text-xl leading-relaxed mb-8 lg:mb-10">
                Stop guessing. Start knowing. LedgerMind connects your data to our ultra-smart AI copilot. 
                Experience absolute financial clarity in one ruthlessly clean dashboard.
              </p>

              <div className="flex flex-wrap items-center gap-5 lg:gap-6">
                <Link to="/register" className="gradient-primary px-8 py-4 rounded-lg font-black tracking-tight flex items-center justify-center gap-3 group shadow-lg shadow-primary-500/10 w-full sm:w-auto">
                  GET STARTED FOR FREE
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <div className="flex flex-col">
                   <span className="text-xs text-(--text-muted) font-medium">Already have an account?</span>
                   <Link to="/login" className="text-xs text-(--text-main) underline underline-offset-4 hover:text-primary-400 transition-colors">Sign in here →</Link>
                </div>
              </div>
            </motion.div>

            {/* Social Proof (Reference Image Style) */}
            <motion.div variants={itemVariants} className="mt-12 lg:mt-16 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-dark-900 bg-dark-800 flex items-center justify-center overflow-hidden`}>
                     <div className="w-full h-full bg-linear-to-br from-dark-700 to-dark-800" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] md:text-xs text-dark-500 font-medium">
                <span className="text-white font-bold">2,400+</span> users building wealth today.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Dashboard Panel (Split-tone dark background) */}
        <div className="flex-1 bg-black/40 lg:bg-black/60 relative flex flex-col items-center justify-center lg:pl-12 lg:pb-0 pb-20 mt-12 lg:mt-0 px-6">
           {/* Mobile indicator line */}
           <div className="lg:hidden w-12 h-1 bg-dark-700 rounded-full mb-12 opacity-50" />

           <div className="absolute top-10 right-10 hidden lg:flex items-center gap-4 z-30">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-500/10 border border-success-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                <span className="text-[10px] font-bold text-success-500 uppercase tracking-widest">LIVE DASHBOARD</span>
              </div>
           </div>

           <div className="w-full max-w-2xl transform lg:scale-105 lg:translate-x-12 relative">
              <DashboardGraphic />
           </div>

           {/* Backdrop Texture for Right Panel */}
           <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-900/10 blur-[150px] mix-blend-soft-light" />
           </div>
        </div>
      </section>


      {/* ── TRENDY BENTO GRID FEATURES ── */}
      <section className="py-24 lg:py-32 px-6 relative overflow-hidden bg-(--bg-main)">
        <div className="max-w-7xl mx-auto">
          <FadeUp className="mb-16 lg:mb-24">
            <h2 className="text-xs font-black tracking-[0.3em] text-primary-500 uppercase mb-4">The Future of Finance</h2>
            <p className="text-3xl lg:text-5xl font-black text-(--text-main) tracking-tighter max-w-2xl">
              Engineered for the 1%. <br/>
              <span className="text-(--text-muted)">Master your wealth.</span>
            </p>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 auto-rows-[250px] lg:auto-rows-[300px]">
            {/* LARGE BENTO CARD: AI Analysis */}
            <FadeUp delay={0.1} className="md:col-span-8 group relative overflow-hidden rounded-3xl border border-(--border-color) bg-(--bento-bg) p-8 flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                 <Bot size={120} strokeWidth={1} className="text-primary-500" />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6">
                  <Bot size={20} className="text-primary-500" />
                </div>
                <h3 className="text-2xl font-black text-(--text-main) mb-3">Autonomous AI Insights</h3>
                <p className="text-(--text-muted) max-w-md text-sm leading-relaxed">
                  Our neural engine scans your statements in real-time, identifying hidden 
                  patterns and waste that humans simply can't see.
                </p>
              </div>
              {/* Mock Chat Preview inside Bento */}
              <div className="mt-8 flex flex-col gap-2 relative z-10">
                 <div className="bg-(--card-bg) border border-(--border-color) p-3 rounded-2xl rounded-bl-sm max-w-[200px]">
                    <p className="text-[10px] text-(--text-main) font-medium italic">"I found ₹2,400 in duplicate Spotify charges this month."</p>
                 </div>
                 <div className="bg-primary-600 p-3 rounded-2xl rounded-br-sm self-end text-[10px] font-bold text-white uppercase tracking-wider">
                    REDUCE WASTE
                 </div>
              </div>
            </FadeUp>

            {/* SMALL BENTO CARD: Security */}
            <FadeUp delay={0.2} className="md:col-span-4 group relative overflow-hidden rounded-3xl border border-(--border-color) bg-linear-to-b from-(--bento-bg) to-(--bg-main) p-8 flex flex-col items-center justify-center text-center">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1] }} 
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="w-20 h-20 rounded-full bg-primary-500/5 border border-primary-500/20 flex items-center justify-center mb-6 relative"
               >
                  <Shield size={32} className="text-primary-500" />
                  <div className="absolute inset-0 rounded-full border border-primary-500/40 animate-ping" />
               </motion.div>
               <h3 className="text-xl font-bold text-(--text-main) mb-2">Vault-Grade</h3>
               <p className="text-(--text-muted) text-xs px-4">AES-256 end-to-end encryption. Your bank data stays your bank data.</p>
            </FadeUp>

            {/* MEDIUM BENTO CARD: Analytics */}
            <FadeUp delay={0.3} className="md:col-span-4 group relative overflow-hidden rounded-3xl border border-(--border-color) bg-(--bento-bg) p-8 text-left">
               <h3 className="text-xl font-bold text-(--text-main) mb-4">Precision Flow</h3>
               <div className="space-y-3 mb-6">
                  {[40, 70, 50, 90].map((w, i) => (
                    <div key={i} className="h-2 w-full bg-(--card-bg) rounded-full overflow-hidden border border-(--border-color)">
                       <motion.div 
                         initial={{ width: 0 }}
                         whileInView={{ width: `${w}%` }}
                         className="h-full bg-primary-500" 
                       />
                    </div>
                  ))}
               </div>
               <p className="text-(--text-muted) text-xs">Dynamic cash-flow visualization with zero latency.</p>
            </FadeUp>

            {/* LARGE BENTO CARD: Integration */}
            <FadeUp delay={0.4} className="md:col-span-8 group relative overflow-hidden rounded-3xl border border-(--border-color) bg-linear-to-br from-(--bento-bg) to-(--bg-main) p-8 flex flex-col lg:flex-row items-center gap-8">
               <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl font-black text-(--text-main) mb-4">Native Bank Sync</h3>
                  <p className="text-(--text-muted) text-sm mb-6">
                    Connect 10,000+ financial institutions worldwide instantly through our secure gateway.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    {['HDFC', 'ICICI', 'SBI', 'AXIS', 'CHASE'].map(bank => (
                      <span key={bank} className="px-3 py-1 rounded bg-black/10 border border-(--border-color) text-[10px] font-mono text-(--text-muted)">{bank}</span>
                    ))}
                  </div>
               </div>
               <div className="flex-1 w-full bg-(--bento-bg) rounded-2xl border border-(--border-color) p-4 transform rotate-1 group-hover:rotate-0 transition-transform shadow-sm">
                  <div className="h-4 w-1/2 bg-(--text-main)/5 rounded mb-4" />
                  <div className="h-20 w-full bg-(--text-main)/5 rounded-lg border border-dashed border-(--border-color) flex items-center justify-center">
                     <span className="text-[10px] text-(--text-muted) italic">Processing transaction log...</span>
                  </div>
               </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-(--border-color) py-12 px-6 bg-(--bg-main)">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-(--text-muted)">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Wallet size={16} className="text-(--text-muted)" />
            <span className="font-semibold text-(--text-main) tracking-wider">LEDGERMIND</span>
          </div>
          <p>Engineered for the modern financial professional. © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
