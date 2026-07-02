import { motion } from 'framer-motion';
import { posterUrl } from '../../utils/tmdbImageUrl';
import { getProgressPercent } from '../../utils/formatTime';
import { useNavigate } from 'react-router-dom';
import { Play, Check } from 'lucide-react';

const STATUS_COLORS = {
  watching: 'status-watching',
  watchlist: 'status-watchlist',
  completed: 'status-completed',
  dropped: 'status-dropped',
  paused: 'status-paused',
};

export default function ShowCard({ item, variant = 'grid', onClick }) {
  const navigate = useNavigate();
  const progress = getProgressPercent(item.watchedEpisodesCount, item.totalEpisodes);
  const poster = item.showPoster ? posterUrl(item.showPoster) : null;

  const handleClick = () => {
    if (onClick) return onClick(item);
    navigate(`/show/${item.tmdbShowId}`);
  };

  if (variant === 'continue') {
    return (
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="flex-shrink-0 w-44 cursor-pointer group"
      >
        <div className="relative rounded-xl overflow-hidden aspect-[2/3] mb-2 shadow-card">
          {poster ? (
            <img src={poster} alt={item.showTitle} className="poster-img group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
              <span className="text-text-muted text-sm">No poster</span>
            </div>
          )}
          {/* Progress ring overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
            <div className="progress-bar mb-1">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-text-secondary font-medium">
              {item.watchedEpisodesCount}/{item.totalEpisodes} eps
            </p>
          </div>
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-12 h-12 rounded-full bg-accent-violet/90 flex items-center justify-center shadow-glow-violet">
              <Play size={20} className="text-white ml-1" />
            </div>
          </div>
        </div>
        <h4 className="text-sm font-semibold text-white truncate leading-tight">{item.showTitle}</h4>
        <p className="text-xs text-text-muted mt-0.5">
          S{String(item.currentSeason).padStart(2, '0')} · E{String(item.currentEpisode).padStart(2, '0')}
        </p>
      </motion.div>
    );
  }

  // Grid variant (library)
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="cursor-pointer group relative"
    >
      <div className="relative rounded-xl overflow-hidden aspect-[2/3] shadow-card">
        {poster ? (
          <img src={poster} alt={item.showTitle} className="poster-img group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
            <span className="text-text-muted text-2xl">📺</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={`badge text-[10px] ${STATUS_COLORS[item.status] || 'status-watchlist'}`}>
            {item.status === 'completed' ? <Check size={10} /> : null}
            {item.status}
          </span>
        </div>

        {/* Bottom gradient with progress */}
        <div className="absolute bottom-0 left-0 right-0">
          {item.status === 'watching' && (
            <div className="progress-bar rounded-none" style={{ height: '3px' }}>
              <div className="progress-bar-fill rounded-none" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 flex flex-col items-center justify-center gap-2">
          <button className="btn-primary text-xs px-4 py-2">View Details</button>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white mt-2 truncate">{item.showTitle}</h4>
      {item.status === 'watching' && (
        <p className="text-xs text-text-muted mt-0.5">{progress}% complete</p>
      )}
    </motion.div>
  );
}
