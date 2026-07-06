import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Eye, RotateCcw } from 'lucide-react';
import { thumbUrl } from '../../utils/tmdbImageUrl';
import { formatMinutes, formatDate } from '../../utils/formatTime';

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

  return (
    <>
      <div
        className="episode-row select-none"
        style={{ opacity: isWatched ? 0.7 : 1 }}
      >
        {/* Thumbnail */}
        <div style={{ flexShrink: 0, width: 80, height: 56, borderRadius: 4, overflow: 'hidden', background: '#1a1a1a' }}>
          {thumb ? (
            <img src={thumb} alt={episode.name} className="poster-img" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 20 }}>🎬</div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
              S{String(season).padStart(2, '0')} | E{String(episode.episode_number).padStart(2, '0')}
            </span>
          </div>
          <p style={{ color: isWatched ? '#666' : '#999', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {episode.name}
          </p>
          {rewatchCount > 0 && (
            <span style={{ color: '#F5C518', fontSize: 10 }}>+{rewatchCount} rewatch</span>
          )}
        </div>

        {/* Check button */}
        <motion.button
          onClick={handleCheck}
          whileTap={{ scale: 0.85 }}
          className={`check-btn ${isWatched ? 'watched' : ''}`}
          aria-label={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
          style={{ flexShrink: 0 }}
          onContextMenu={(e) => { e.preventDefault(); setContextMenu(true); }}
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
                <Check size={18} color="#fff" strokeWidth={3} />
              </motion.div>
            ) : (
              <motion.div
                key="unchecked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {/* empty circle icon */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Bottom sheet context menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setContextMenu(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: 430,
                zIndex: 50,
                background: '#1a1a1a',
                borderRadius: '16px 16px 0 0',
                padding: '8px 0 32px',
              }}
            >
              <div style={{ width: 40, height: 4, background: '#444', borderRadius: 2, margin: '8px auto 16px' }} />
              <p style={{ color: '#888', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 20px 12px' }}>
                Mark as...
              </p>
              {!isWatched && (
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 20px', background: 'none', border: 'none', color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
                  onClick={() => { onWatch(season, episode.episode_number, episode.name, episode.runtime, episode.air_date); setContextMenu(false); }}
                >
                  <Eye size={20} color="#888" /> Watched
                </button>
              )}
              {isWatched && (
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 20px', background: 'none', border: 'none', color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
                  onClick={() => { onUnwatch(season, episode.episode_number); setContextMenu(false); }}
                >
                  <Eye size={20} color="#888" /> Not watched
                </button>
              )}
              {isWatched && (
                <button
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 20px', background: 'none', border: 'none', color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}
                  onClick={() => { onRewatch(season, episode.episode_number); setContextMenu(false); }}
                >
                  <RotateCcw size={20} color="#888" /> Rewatched (+1)
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
