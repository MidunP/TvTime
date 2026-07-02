import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { showService } from '../services/showService';
import { listService } from '../services/listService';
import api from '../services/api';
import { posterUrl } from '../utils/tmdbImageUrl';
import ShowCard from '../components/show/ShowCard';
import { Heart, List, Tv, Play, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user } = useAuth();

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
    queryFn: () => api.get('/stats').then((r) => r.data),
  });

  const favorites = watchlist.filter((s) => s.isFavorite);
  const watching = watchlist.filter((s) => s.status === 'watching');
  const completed = watchlist.filter((s) => s.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Profile hero */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
      >
        {/* Background gradient */}
        <div className="h-32 bg-gradient-to-r from-accent-violet/30 via-accent-coral/20 to-accent-violet/10 rounded-3xl" />

        <div className="px-8 pb-6 -mt-10 flex items-end gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-violet flex items-center justify-center text-3xl font-black text-white shadow-glow-violet border-4 border-bg-primary flex-shrink-0">
            {user?.displayName?.[0]?.toUpperCase() || 'M'}
          </div>
          <div className="mb-1">
            <h1 className="text-2xl font-black text-white">{user?.displayName}</h1>
            <p className="text-text-muted text-sm">@{user?.username}</p>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Watching', value: watching.length, icon: Play },
          { label: 'Completed', value: completed.length, icon: CheckCircle },
          { label: 'Total Eps', value: stats?.totalEpisodes || 0, icon: Tv },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Favorite shows */}
      {favorites.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <Heart size={18} className="text-red-400" fill="currentColor" /> Favorite Shows
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {favorites.map((s) => (
              <ShowCard key={s._id} item={s} />
            ))}
          </div>
        </section>
      )}

      {/* Custom Lists preview */}
      {lists.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              <List size={18} className="text-accent-violet" /> Lists
            </h2>
            <Link to="/lists" className="text-sm text-text-muted hover:text-accent-violet flex items-center gap-1 transition-colors">
              See all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-4 scroll-x pb-2">
            {lists.slice(0, 6).map((list) => {
              const posterUrls = watchlist
                .filter((w) => list.showIds.includes(w.tmdbShowId) && w.showPoster)
                .slice(0, 1)
                .map((w) => posterUrl(w.showPoster));

              return (
                <Link key={list._id} to={`/lists/${list._id}`}>
                  <motion.div whileHover={{ scale: 1.05, y: -3 }} className="flex-shrink-0 w-28 cursor-pointer">
                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-bg-tertiary mb-2 relative">
                      {posterUrls[0] ? (
                        <img src={posterUrls[0]} alt={list.name} className="poster-img" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">{list.emoji}</div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs font-bold text-white truncate">{list.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted text-center">{list.showIds.length} shows</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All shows grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <Tv size={18} className="text-accent-violet" /> All Shows
          </h2>
          <Link to="/library" className="text-sm text-text-muted hover:text-accent-violet flex items-center gap-1 transition-colors">
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {watchlist.slice(0, 12).map((s) => (
            <ShowCard key={s._id} item={s} />
          ))}
        </div>
      </section>
    </div>
  );
}
