import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { showService } from '../services/showService';
import { listService } from '../services/listService';
import { posterUrl } from '../utils/tmdbImageUrl';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Heart, Tv, Film, Bell, MoreHorizontal, User } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => listService.getLists(),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => showService.getStats(),
  });

  const favorites = watchlist.filter((s) => s.isFavorite);
  const watching = watchlist.filter((s) => s.status === 'watching');
  const allShows = watchlist.slice(0, 10);

  // Format TV time: total minutes → months, days, hours
  const totalMins = stats?.hoursWatched ? stats.hoursWatched * 60 : 0;
  const months = Math.floor(totalMins / (60 * 24 * 30));
  const days = Math.floor((totalMins % (60 * 24 * 30)) / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);

  return (
    <div className="space-y-6 min-h-screen">
      {/* Profile Hero Header */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-6 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Background Backdrop */}
        {watching.length > 0 && watching[0].showPoster && !imgError ? (
          <img
            src={posterUrl(watching[0].showPoster)}
            alt=""
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-125"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/40 via-slate-900 to-[#FFD500]/10" />
        )}

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FFD500] to-yellow-600 p-0.5 shadow-[0_0_25px_rgba(255,213,0,0.3)]">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white text-2xl font-black">
                {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {user?.displayName || user?.username || 'TV Time Member'}
              </h1>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                @{user?.username || 'member'} • Joined 2026
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  id="edit-profile-btn"
                  className="px-4 py-1.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-extrabold text-white tracking-wider uppercase transition-all"
                >
                  EDIT PROFILE
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-[#FFD500] transition-colors">
              <Bell size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: user?.following || 0, label: 'FOLLOWING' },
          { val: user?.followers || 0, label: 'FOLLOWERS' },
          { val: stats?.totalEpisodes || watchlist.length, label: 'EPISODES' },
        ].map((item) => (
          <div key={item.label} className="glass-panel p-4 text-center">
            <span className="text-xl sm:text-2xl font-black text-white block">
              {item.val}
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 block">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Watch Time Stat Highlight */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFD500]/10 border border-[#FFD500]/30 flex items-center justify-center text-[#FFD500]">
              <Tv size={18} />
            </div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              TV Time Watch Stat
            </h3>
          </div>
          <Link to="/stats" className="text-xs font-bold text-[#FFD500] flex items-center gap-1 hover:underline">
            <span>Details</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-white/5">
            <span className="text-2xl sm:text-3xl font-black text-[#FFD500] block">{months}</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">MONTHS</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-white/5">
            <span className="text-2xl sm:text-3xl font-black text-white block">{days}</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">DAYS</span>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center border border-white/5">
            <span className="text-2xl sm:text-3xl font-black text-white block">{hours}</span>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">HOURS</span>
          </div>
        </div>
      </div>

      {/* Tracked Shows Grid */}
      {allShows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="section-pill">
              MY SHOWS ({watchlist.length})
            </span>
            <Link to="/library" className="text-xs font-bold text-slate-400 hover:text-white">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {allShows.map((s) => (
              <div
                key={s._id}
                onClick={() => navigate(`/show/${s.tmdbShowId}`)}
                className="poster-card"
              >
                {s.showPoster ? (
                  <img src={posterUrl(s.showPoster)} alt={s.showTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-900">
                    <span className="text-2xl mb-1">📺</span>
                    <span className="text-[10px] font-bold text-slate-300 line-clamp-2">{s.showTitle}</span>
                  </div>
                )}
                <div className="card-progress" style={{ background: '#FFD500' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Shows Section */}
      {favorites.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="section-pill !border-rose-500/30 !bg-rose-500/10 text-rose-300">
              <Heart size={14} className="fill-rose-500 text-rose-500" />
              FAVORITES
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {favorites.map((s) => (
              <div
                key={s._id}
                onClick={() => navigate(`/show/${s.tmdbShowId}`)}
                className="poster-card"
              >
                {s.showPoster ? (
                  <img src={posterUrl(s.showPoster)} alt={s.showTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-900">📺</div>
                )}
                <div className="card-progress bg-rose-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

