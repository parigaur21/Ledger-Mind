import { useRef, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
  AnimatePresence
} from 'framer-motion';
import {
  ArrowRight,
  Bot,
  LineChart,
  Shield,
  Zap,
  Wallet,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronDown,
  Upload,
  MessageSquare,
  PieChart
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
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const ScaleIn = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════
   ANIMATED ORB BACKGROUND
   ═══════════════════════════════════════════ */
const OrbBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 40, stiffness: 150 });
  const smoothY = useSpring(mouseY, { damping: 40, stiffness: 150 });

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div
        className="absolute w-[900px] h-[900px] rounded-full opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, #00E5FF 0%, transparent 70%)',
          x: useTransform(smoothX, v => v * 0.05),
          y: useTransform(smoothY, v => v * 0.05),
          top: '10%',
          left: '15%',
        }}
      />
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full opacity-[0.06]"
        style={{
          background: 'radial-gradient(circle, #FF00E5 0%, transparent 70%)',
          x: useTransform(smoothX, v => v * -0.03),
          y: useTransform(smoothY, v => v * -0.03),
          bottom: '5%',
          right: '10%',
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, #39FF14 0%, transparent 70%)',
          x: useTransform(smoothX, v => v * 0.02),
          y: useTransform(smoothY, v => v * 0.02),
          top: '50%',
          left: '50%',
        }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════════
   ANIMATED FLOATING RINGS (Hero Visual)
   ═══════════════════════════════════════════ */
const FloatingRings = () => (
  <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px]">
    {/* Outer ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-0 rounded-full border border-[#00E5FF]/20"
    />
    {/* Middle ring */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-[15%] rounded-full border border-[#FF00E5]/20"
    >
      <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-[#FF00E5] shadow-[0_0_20px_#FF00E5]" />
    </motion.div>
    {/* Inner ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      className="absolute inset-[30%] rounded-full border border-[#39FF14]/20"
    >
      <div className="absolute -bottom-1.5 right-1/4 w-3 h-3 rounded-full bg-[#39FF14] shadow-[0_0_20px_#39FF14]" />
    </motion.div>
    {/* Center glow */}
    <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-[#00E5FF]/10 to-[#FF00E5]/10 backdrop-blur-xl flex items-center justify-center border border-white/5">
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wallet size={48} className="text-[#00E5FF]" />
      </motion.div>
    </div>
    {/* Floating data points */}
    <motion.div
      animate={{ y: [-8, 8, -8] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-[10%] right-[5%] px-3 py-1.5 rounded-full bg-[#111417]/80 backdrop-blur-md border border-[#39FF14]/30 text-xs font-mono text-[#39FF14] flex items-center gap-1.5"
    >
      <TrendingUp size={12} /> +12.4%
    </motion.div>
    <motion.div
      animate={{ y: [6, -6, 6] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute bottom-[15%] left-[0%] px-3 py-1.5 rounded-full bg-[#111417]/80 backdrop-blur-md border border-[#FF00E5]/30 text-xs font-mono text-[#FF00E5] flex items-center gap-1.5"
    >
      <TrendingDown size={12} /> -$42 saved
    </motion.div>
    <motion.div
      animate={{ y: [-5, 10, -5] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-[45%] left-[-10%] px-3 py-1.5 rounded-full bg-[#111417]/80 backdrop-blur-md border border-[#00E5FF]/30 text-xs font-mono text-[#00E5FF] flex items-center gap-1.5"
    >
      <Sparkles size={12} /> AI Insight
    </motion.div>
  </div>
);

/* ═══════════════════════════════════════════
   MOCK DASHBOARD PREVIEW
   ═══════════════════════════════════════════ */
const DashboardPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80, rotateX: 8 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto max-w-5xl"
      style={{ perspective: '1200px' }}
    >
      {/* Browser chrome */}
      <div className="rounded-t-2xl bg-[#1a1c20] border border-white/5 border-b-0 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 ml-4">
          <div className="max-w-md mx-auto bg-[#111318]/80 rounded-lg px-4 py-1 text-xs text-[#849396] text-center font-mono">
            ledgermind.ai/dashboard
          </div>
        </div>
      </div>
      {/* Dashboard content */}
      <div className="rounded-b-2xl bg-[#0c0e12] border border-white/5 border-t-0 p-6 overflow-hidden">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar mock */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20">
              <PieChart size={14} className="text-[#00E5FF]" />
              <span className="text-xs text-[#00E5FF] font-medium">Dashboard</span>
            </div>
            {['Expenses', 'Analytics', 'AI Chat', 'Budgets'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#849396] hover:bg-white/5 transition-colors">
                <div className="w-3.5 h-3.5 rounded bg-[#282a2e]" />
                <span className="text-xs">{item}</span>
              </div>
            ))}
          </div>
          {/* Main content */}
          <div className="col-span-10 space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Balance', value: '$24,580', change: '+8.2%', color: '#00E5FF' },
                { label: 'Monthly Spend', value: '$3,420', change: '-12%', color: '#39FF14' },
                { label: 'Subscriptions', value: '14 Active', change: '2 flagged', color: '#FF00E5' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
                  className="rounded-xl bg-[#191c1f] p-4 border border-white/5"
                >
                  <p className="text-[10px] uppercase tracking-wider text-[#849396] mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] mt-1" style={{ color: stat.color }}>{stat.change}</p>
                </motion.div>
              ))}
            </div>
            {/* Chart area */}
            <div className="rounded-xl bg-[#191c1f] p-4 border border-white/5 h-40 flex items-end gap-1">
              {[35, 55, 45, 70, 50, 80, 60, 90, 75, 55, 65, 85, 70, 60, 50, 75, 80, 65, 90, 70].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={isInView ? { height: `${h}%` } : {}}
                  transition={{ delay: 0.6 + i * 0.03, duration: 0.5, ease: 'easeOut' }}
                  className="flex-1 rounded-t"
                  style={{
                    background: `linear-gradient(to top, ${i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#39FF14' : '#FF00E5'}30, transparent)`,
                    borderTop: `2px solid ${i % 3 === 0 ? '#00E5FF' : i % 3 === 1 ? '#39FF14' : '#FF00E5'}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Glow effect under the preview */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-[#00E5FF]/10 blur-[80px] rounded-full pointer-events-none" />
    </motion.div>
  );
};



/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */
const Landing = () => {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const navBg = useTransform(scrollYProgress, [0, 0.05], ['rgba(5,7,10,0)', 'rgba(5,7,10,0.85)']);

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="bg-[#05070a] text-[#e1e2e7] overflow-x-hidden">
      <OrbBackground />

      {/* ── NAVBAR ── */}
      <motion.nav
        style={{ backgroundColor: navBg }}
        className="fixed top-0 w-full z-[100] backdrop-blur-xl border-b border-white/[0.03]"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#FF00E5] flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.3)]">
              <Wallet size={20} className="text-[#05070a]" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">LEDGERMIND</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-medium text-[#bac9cc] hover:text-white transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="px-5 py-2.5 rounded-full text-sm font-bold bg-white text-[#05070a] hover:bg-[#e1e2e7] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO SECTION ── */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
      >
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                <span className="text-xs font-semibold text-[#00E5FF] tracking-wider uppercase">v2.0 — AI-Powered Financial Copilot</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35 }}
              className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tighter text-white mb-8"
            >
              See where
              <br />
              your money
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] via-[#39FF14] to-[#FF00E5]">
                actually goes.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-lg text-[#849396] max-w-lg leading-relaxed mb-10"
            >
              Upload bank statements. Get AI-powered insights. Track subscriptions.
              Prevent impulse spending. All in one obsidian-grade interface.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="flex items-center gap-4"
            >
              <Link to="/register" className="group px-8 py-4 rounded-full font-bold bg-gradient-to-r from-[#00E5FF] to-[#39FF14] text-[#05070a] shadow-[0_0_40px_rgba(0,229,255,0.25)] hover:shadow-[0_0_60px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2">
                Start Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-6 py-4 rounded-full font-medium border border-[#3b494c] hover:border-[#00E5FF]/40 text-[#bac9cc] hover:text-white transition-all">
                View Demo
              </Link>
            </motion.div>
          </div>

          {/* Right - Animated Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex justify-center"
          >
            <FloatingRings />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#849396]">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown size={18} className="text-[#849396]" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="py-32 px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#00E5FF] font-semibold mb-4">The Command Center</p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Your finances. Illuminated.
          </h2>
        </FadeUp>
        <DashboardPreview />
      </section>



      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#849396]">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-[#00E5FF]" />
            <span>LedgerMind © {new Date().getFullYear()}</span>
          </div>
          <p>Built with MongoDB, OpenAI & React</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
