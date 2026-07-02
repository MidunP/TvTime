import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';
import { formatCountdown, formatDate } from '../utils/formatTime';
import { Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// We get upcoming episodes from watchlist items that have next episodes to watch
// Combined with TMDb season data for air dates

function UpcomingCard({ show, episode, daysLabel, network }) {
  const poster = show.showPoster ? posterUrl(show.showPoster) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="card p-4 flex items-center gap-4"
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-bg-tertiary">
        {poster ? (
          <img src={poster} alt={show.showTitle} className="poster-img" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">📺</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/show/${show.tmdbShowId}`} className="hover:text-accent-violet transition-colors">
          <h4 className="font-bold text-white text-sm truncate">{show.showTitle}</h4>
        </Link>
        {episode && (
          <p className="text-xs text-text-muted mt-0.5 font-mono">
            S{String(episode.season || 1).padStart(2, '0')} · E{String(episode.episode || 1).padStart(2, '0')}
          </p>
        )}
        {network && (
          <p className="text-xs text-text-muted mt-0.5">{network}</p>
        )}
      </div>

      {/* Countdown */}
      <div className="text-right flex-shrink-0">
        <div className={`countdown-pill ${daysLabel === 'TODAY' || daysLabel === 'TOMORROW' ? 'bg-accent-coral/20 text-accent-coral border-accent-coral/40' : ''}`}>
          {daysLabel}
        </div>
      </div>
    </motion.div>
  );
}

export default function UpcomingPage() {
  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  // Filter watching/watchlist shows with up-to-date info
  const activeShows = watchlist.filter((s) => ['watching', 'watchlist', 'paused'].includes(s.status));

  // For simplicity, we group active shows by their next air date from TMDb
  // We'll show them as "continuing" shows in the upcoming section
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-white">Upcoming</h1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Upcoming Episodes</h1>
        <p className="text-text-muted text-sm">Next episodes from shows you're watching</p>
      </div>

      {activeShows.length === 0 ? (
        <div className="py-24 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-lg font-bold text-white mb-2">Nothing upcoming</h3>
          <p className="text-text-muted">Add shows to your watchlist to track upcoming episodes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Currently Watching */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <h2 className="section-title text-base">Currently Watching</h2>
            </div>
            <div className="space-y-3">
              {activeShows.filter((s) => s.status === 'watching').map((show) => (
                <UpcomingCard
                  key={show._id}
                  show={show}
                  episode={{ season: show.currentSeason, episode: show.currentEpisode + 1 }}
                  daysLabel="IN PROGRESS"
                  network={show.networks?.[0]}
                />
              ))}
              {activeShows.filter((s) => s.status === 'watching').length === 0 && (
                <p className="text-text-muted text-sm py-4">No shows currently watching.</p>
              )}
            </div>
          </section>

          {/* Watch Later */}
          {activeShows.filter((s) => s.status === 'watchlist').length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-accent-violet" />
                <h2 className="section-title text-base">Watch Later</h2>
              </div>
              <div className="space-y-3">
                {activeShows.filter((s) => s.status === 'watchlist').slice(0, 10).map((show) => (
                  <UpcomingCard
                    key={show._id}
                    show={show}
                    episode={null}
                    daysLabel="QUEUED"
                    network={show.networks?.[0]}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Paused */}
          {activeShows.filter((s) => s.status === 'paused').length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-accent-gold" />
                <h2 className="section-title text-base">On Hold</h2>
              </div>
              <div className="space-y-3">
                {activeShows.filter((s) => s.status === 'paused').map((show) => (
                  <UpcomingCard
                    key={show._id}
                    show={show}
                    episode={{ season: show.currentSeason, episode: show.currentEpisode }}
                    daysLabel="PAUSED"
                    network={show.networks?.[0]}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
