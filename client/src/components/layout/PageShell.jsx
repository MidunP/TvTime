import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.99 },
};

export default function PageShell({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col items-center relative overflow-x-hidden selection:bg-[#FFD500]/30 selection:text-[#FFD500]">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-[#FFD500]/[0.05] via-purple-600/[0.02] to-transparent pointer-events-none blur-3xl -z-10" />
      <div className="fixed bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/[0.03] pointer-events-none blur-3xl -z-10" />

      {/* Main Responsive Wrapper */}
      <div className="app-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="page-content"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Responsive Nav Header/Bar */}
        <BottomNav />
      </div>
    </div>
  );
}

