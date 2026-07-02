import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, RotateCcw } from 'lucide-react';
import { thumbUrl } from '../../utils/tmdbImageUrl';
import { formatMinutes, formatDate } from '../../utils/formatTime';
import { useState } from 'react';

export default function EpisodeRow({
  episode,
  showId,
  season,
  isWatched,
  isNext,
  rewatchCount,
  onWatch,
  onUnwatch,
  onRewatch,
}) {
  const [contextMenu, setContextMenu] = useState(false);
  const [animating, setAnimating] = useState(false);

  const thumb = episode.still_path ? thumbUrl(episode.still_path) : null;

  const handleCheck = async () => {
    if (animating) return;
    setAnimating(true);
    if (isWatched) {
      await onUnwatch(season, episode.episode_number);
    } else {
      await onWatch(season, episode.episode_number, episode.name, episode.runtime, episode.air_date);
    }
    setAnimating(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className={`episode-row select-none ${isNext ? 'next-episode' : ''}`}
        onContextMenu={handleContextMenu}
      >
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-bg-tertiary">
          {thumb ? (
            <img src={thumb} alt={episode.name} className="poster-img" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
              No preview
            </div>
          )}
          {isNext && (
            <div className="absolute inset-0 border-2 border-accent-gold rounded-lg" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-text-secondary">
              S{String(season).padStart(2, '0')}·E{String(episode.episode_number).padStart(2, '0')}
            </span>
            {isNext && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">
                Next
              </span>
            )}
            {rewatchCount > 0 && (
              <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                <RotateCcw size={9} /> {rewatchCount}×
              </span>
            )}
          </div>
          <h4
            className={`text-sm font-medium mt-0.5 truncate ${
              isWatched ? 'text-text-secondary line-through decoration-text-muted/40' : 'text-white'
            }`}
          >
            {episode.name}
          </h4>
          <div className="flex items-center gap-3 mt-0.5">
            {episode.runtime > 0 && (
              <span className="text-xs text-text-muted">{formatMinutes(episode.runtime)}</span>
            )}
            {episode.air_date && (
              <span className="text-xs text-text-muted">{formatDate(episode.air_date)}</span>
            )}
          </div>
        </div>

        {/* Check button */}
        <motion.button
          onClick={handleCheck}
          whileTap={{ scale: 0.85 }}
          className={`check-btn ${isWatched ? 'watched' : ''}`}
          aria-label={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
        >
          <AnimatePresence mode="wait">
            {isWatched ? (
              <motion.div
                key="checked"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Check size={16} className="text-bg-primary" strokeWidth={3} />
              </motion.div>
            ) : (
              <motion.div
                key="unchecked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Eye size={15} className="text-text-muted" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Context menu (right-click) */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl p-2 w-64 shadow-card"
            >
              <p className="text-xs text-text-muted px-3 py-1.5 font-medium uppercase tracking-wider">
                Mark as...
              </p>
              {isWatched && (
                <button
                  className="btn-ghost w-full justify-start text-sm text-text-primary"
                  onClick={() => {
                    onUnwatch(season, episode.episode_number);
                    setContextMenu(false);
                  }}
                >
                  <Eye size={15} className="text-text-muted" /> Not watched
                </button>
              )}
              {isWatched && (
                <button
                  className="btn-ghost w-full justify-start text-sm text-text-primary"
                  onClick={() => {
                    onRewatch(season, episode.episode_number);
                    setContextMenu(false);
                  }}
                >
                  <RotateCcw size={15} className="text-text-muted" /> Rewatched (+1)
                </button>
              )}
              {!isWatched && (
                <button
                  className="btn-ghost w-full justify-start text-sm text-text-primary"
                  onClick={() => {
                    onWatch(season, episode.episode_number, episode.name, episode.runtime, episode.air_date);
                    setContextMenu(false);
                  }}
                >
                  <Check size={15} className="text-accent-green" /> Mark as watched
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
