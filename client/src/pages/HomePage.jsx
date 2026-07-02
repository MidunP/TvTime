import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { showService } from '../services/showService';
import { useAuth } from '../context/AuthContext';
import ShowCard from '../components/show/ShowCard';
import api from '../services/api';
import { posterUrl } from '../utils/tmdbImageUrl';
import { formatCountdown } from '../utils/formatTime';
import { Flame, Tv, CheckCircle, Clock, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function SectionHeader({ title, icon: Icon, to }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-accent-violet" />}
        <h2 className="section-title">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="text-sm text-text-muted hover:text-accent-violet flex items-center gap-1 transition-colors">
          See all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

function StatCard({ value, label, icon: Icon, color = 'text-accent-violet' }) {
  return (
    <motion.div variants={item} className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color === 'text-accent-violet' ? 'bg-accent-violet/15' : color === 'text-accent-coral' ? 'bg-accent-coral/15' : 'bg-accent-green/15'}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats').then((r) => r.data),
  });

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => showService.getTrending(),
  });

  const watching = watchlist.filter((s) => s.status === 'watching');
  const notStarted = watchlist.filter((s) => s.status === 'watchlist');
  const completed = watchlist.filter((s) => s.status === 'completed').slice(0, 6);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-black text-white">
          {greeting()}, <span className="text-transparent bg-clip-text bg-gradient-violet">{user?.displayName} 👋</span>
        </h1>
        <p className="text-text-secondary mt-1">
          {watching.length > 0
            ? `You're watching ${watching.length} show${watching.length > 1 ? 's' : ''} right now.`
            : "What are we watching today?"}
        </p>
      </motion.div>

      {/* Stats strip */}
      {stats && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard value={stats.totalEpisodes} label="Episodes Watched" icon={Play} color="text-accent-violet" />
          <StatCard value={stats.hoursWatched + 'h'} label="Hours Watched" icon={Clock} color="text-accent-coral" />
          <StatCard value={stats.completedShows} label="Completed Shows" icon={CheckCircle} color="text-accent-green" />
          <StatCard value={`${stats.currentStreak}🔥`} label="Day Streak" icon={Flame} color="text-accent-coral" />
        </motion.div>
      )}

      {/* Continue Watching */}
      {watching.length > 0 && (
        <section>
          <SectionHeader title="Continue Watching" icon={Play} to="/library?status=watching" />
          <div className="flex gap-4 scroll-x pb-2">
            {watching.map((s) => (
              <ShowCard key={s._id} item={s} variant="continue" />
            ))}
          </div>
        </section>
      )}

      {/* Watchlist / Haven't Started */}
      {notStarted.length > 0 && (
        <section>
          <SectionHeader title="Up Next" icon={Tv} to="/library?status=watchlist" />
          <div className="flex gap-4 scroll-x pb-2">
            {notStarted.slice(0, 10).map((s) => (
              <ShowCard key={s._id} item={s} variant="continue" />
            ))}
          </div>
        </section>
      )}

      {/* Recently Completed */}
      {completed.length > 0 && (
        <section>
          <SectionHeader title="Completed" icon={CheckCircle} to="/library?status=completed" />
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
          >
            {completed.map((s) => (
              <motion.div key={s._id} variants={item}>
                <ShowCard item={s} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Trending (from TMDb) */}
      {trending?.results?.length > 0 && (
        <section>
          <SectionHeader title="Trending This Week" to="/search" />
          <div className="flex gap-4 scroll-x pb-2">
            {trending.results.slice(0, 12).map((show) => (
              <motion.div
                key={show.id}
                whileHover={{ scale: 1.04, y: -4 }}
                className="flex-shrink-0 w-36 cursor-pointer"
              >
                <Link to={`/show/${show.id}`}>
                  <div className="relative rounded-xl overflow-hidden aspect-[2/3] shadow-card mb-2">
                    {show.poster_path ? (
                      <img
                        src={posterUrl(show.poster_path)}
                        alt={show.name}
                        className="poster-img"
                      />
                    ) : (
                      <div className="w-full h-full bg-bg-tertiary flex items-center justify-center text-2xl">📺</div>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-white truncate">{show.name}</h4>
                  <p className="text-[10px] text-text-muted">{show.first_air_date?.split('-')[0]}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {watchlist.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-bold text-white mb-2">Your list is empty!</h3>
          <p className="text-text-muted mb-6">Search for your favorite shows to get started.</p>
          <Link to="/search" className="btn-primary">
            Explore Shows
          </Link>
        </motion.div>
      )}
    </div>
  );
}
