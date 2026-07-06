import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export default function PageShell({ children }) {
  const location = useLocation();

  return (
    <div
      style={{
        background: '#000',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div className="app-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="page-content"
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <BottomNav />
      </div>
    </div>
  );
}
