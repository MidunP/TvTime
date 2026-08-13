import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';

const STATUS_BAR = {
  watching: '#FFD500',
  watchlist: '#3B82F6',
  completed: '#10B981',
  paused: '#F59E0B',
  dropped: '#EF4444',
  rewatching: '#8B5CF6',
};

function PosterCard({ item }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const poster = item.showPoster ? posterUrl(item.showPoster) : null;
  const barColor = STATUS_BAR[item.status] || '#FFD500';

  return (
    <div
      onClick={() => navigate(`/show/${item.tmdbShowId}`)}
      className="poster-card group relative"
    >
      {poster && !imgError ? (
        <img
          src={poster}
          alt={item.showTitle}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80">
          <span className="text-3xl mb-2 drop-shadow-md">📺</span>
          <span className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight">
            {item.showTitle}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold mt-1">
            {item.showYear || 'TV Series'}
          </span>
        </div>
      )}

      {/* Title overlay gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-2.5">
        <span className="text-xs font-bold text-white line-clamp-1 truncate drop-shadow">
          {item.showTitle}
        </span>
      </div>

      {/* Status Bar Indicator */}
      <div className="card-progress" style={{ background: barColor }} />
    </div>
  );
}

function WatchNextCard({ item }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const poster = item.showPoster ? posterUrl(item.showPoster) : null;

  return (
    <div
      onClick={() => navigate(`/show/${item.tmdbShowId}`)}
      className="cursor-pointer group flex-shrink-0 w-36 sm:w-44"
    >
      <div className="rounded-xl overflow-hidden aspect-[2/3] relative mb-2 bg-slate-900 border border-white/10 group-hover:border-[#FFD500]/50 transition-all group-hover:shadow-[0_8px_20px_rgba(255,213,0,0.15)] group-hover:-translate-y-1">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={item.showTitle}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-slate-900 to-slate-950">
            <span className="text-4xl mb-2">📺</span>
            <span className="text-xs font-bold text-slate-200 line-clamp-2">
              {item.showTitle}
            </span>
          </div>
        )}

        {/* Episode badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] font-extrabold text-[#FFD500]">
          S{item.currentSeason || 1} E{(item.currentEpisode || 0) + 1}
        </div>

        {/* Yellow progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFD500] shadow-[0_0_8px_#FFD500]" />
      </div>
      <p className="text-xs font-bold text-slate-200 truncate group-hover:text-[#FFD500] transition-colors">
        {item.showTitle}
      </p>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('watchlist');

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const watching = watchlist.filter((s) => s.status === 'watching');
  const notStarted = watchlist.filter((s) => s.status === 'watchlist');

  return (
    <div className="min-h-screen">
      {/* Top Header Tabs */}
      <div className="flex items-center justify-center border-b border-white/10 mb-6 bg-slate-950/40 backdrop-blur-md sticky top-16 md:top-16 z-20 rounded-2xl p-1">
        <button
          id="tab-watchlist"
          onClick={() => setActiveTab('watchlist')}
          className={`top-tab ${activeTab === 'watchlist' ? 'active' : ''}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <polyline points="17 2 12 7 7 2" />
          </svg>
          <span>WATCH LIST</span>
        </button>
        <Link
          to="/upcoming"
          className="top-tab text-slate-400 hover:text-slate-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>UPCOMING</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="skeleton h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="skeleton aspect-[2/3] rounded-xl" />
            ))}
          </div>
        </div>
      ) : watchlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel flex flex-col items-center justify-center p-12 text-center my-12"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFD500]/20 to-yellow-600/10 border border-[#FFD500]/30 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(255,213,0,0.2)]">
            📺
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Your Watchlist is Empty</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
            Search for TV series or movies to track watched episodes, keep up with new releases, and calculate your watch statistics.
          </p>
          <Link to="/explore" className="btn-yellow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>EXPLORE SHOWS</span>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* WATCH NEXT SECTION */}
          {watching.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="section-pill">
                  <span className="w-2 h-2 rounded-full bg-[#FFD500] animate-pulse" />
                  WATCH NEXT
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {watching.length} show{watching.length > 1 ? 's' : ''} in progress
                </span>
              </div>

              <div className="scroll-x flex gap-3.5 pb-2 pt-1 -mx-2 px-2">
                {watching.map((item) => (
                  <WatchNextCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* HAVEN'T STARTED SECTION */}
          {notStarted.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="section-pill">
                  HAVEN'T STARTED ({notStarted.length})
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {notStarted.map((item) => (
                  <PosterCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ALL WATCHING IF NO UNSTARTED */}
          {notStarted.length === 0 && watching.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="section-pill">ALL TRACKED SHOWS</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {watching.map((item) => (
                  <PosterCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

