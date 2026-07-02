import { motion } from 'framer-motion';
import { backdropUrl } from '../../utils/tmdbImageUrl';

export default function HeroBackdrop({ backdropPath, title, children }) {
  const bg = backdropPath ? backdropUrl(backdropPath) : null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ minHeight: 320 }}>
      {/* Backdrop image */}
      {bg && (
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img src={bg} alt={title} className="w-full h-full object-cover object-center" />
        </motion.div>
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-8 flex items-end min-h-[320px]">
        {children}
      </div>
    </div>
  );
}
