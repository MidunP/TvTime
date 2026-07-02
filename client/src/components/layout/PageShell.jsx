import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function PageShell({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <motion.main
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
