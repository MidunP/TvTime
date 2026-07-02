import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';
import { formatYear } from '../utils/formatTime';
import { Search, Plus, Check, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Debounce hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchResultCard({ show, isInList, onAdd }) {
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const poster = show.poster_path ? posterUrl(show.poster_path) : null;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isInList || adding) return;
    setAdding(true);
    try {
      await onAdd(show);
      toast.success(`${show.name} added to your list! 📺`);
    } catch (err) {
      toast.error('Failed to add show');
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="card p-4 flex gap-4 cursor-pointer group hover:border-accent-violet/30"
      onClick={() => navigate(`/show/${show.id}`)}
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden bg-bg-tertiary">
        {poster ? (
          <img src={poster} alt={show.name} className="poster-img" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📺</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base truncate group-hover:text-accent-violet transition-colors">
              {show.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-text-muted">{formatYear(show.first_air_date)}</span>
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1 text-xs text-accent-gold">
                  <Star size={11} fill="currentColor" /> {show.vote_average.toFixed(1)}
                </span>
              )}
              {show.genre_ids?.length > 0 && (
                <span className="text-xs text-text-muted">{show.original_language?.toUpperCase()}</span>
              )}
            </div>
          </div>

          {/* Add button */}
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isInList
                ? 'bg-accent-green/20 border border-accent-green/40'
                : 'bg-accent-violet/20 border border-accent-violet/40 hover:bg-accent-violet/30'
            }`}
          >
            {adding ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-accent-violet/30 border-t-accent-violet rounded-full"
              />
            ) : isInList ? (
              <Check size={16} className="text-accent-green" />
            ) : (
              <Plus size={16} className="text-accent-violet" />
            )}
          </motion.button>
        </div>

        {show.overview && (
          <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">{show.overview}</p>
        )}

        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs text-accent-violet/70 hover:text-accent-violet flex items-center gap-0.5 group/link">
            View details <ChevronRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const queryClient = useQueryClient();

  // Get existing watchlist for "already added" state
  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const watchlistIds = new Set(watchlist.map((w) => w.tmdbShowId));

  const { data: searchData, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => showService.searchShows(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => showService.getTrending(),
    enabled: !debouncedQuery,
  });

  const handleAddShow = async (show) => {
    await showService.addShow({
      tmdbShowId: show.id,
      showTitle: show.name,
      showPoster: show.poster_path,
      showBackdrop: show.backdrop_path,
      showYear: show.first_air_date?.split('-')[0],
    });
    queryClient.invalidateQueries({ queryKey: ['watchlist'] });
  };

  const results = searchData?.results || [];
  const displayShows = debouncedQuery.length >= 2 ? results : (trending?.results || []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Discover Shows</h1>
        <p className="text-text-muted text-sm">Search millions of TV shows from TMDb</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a TV show..."
          className="input-field pl-12"
          autoFocus
        />
        {isFetching && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent-violet/30 border-t-accent-violet rounded-full"
          />
        )}
      </div>

      {/* Section label */}
      <div className="flex items-center justify-between">
        <h2 className="section-title text-base">
          {debouncedQuery.length >= 2
            ? `Results for "${debouncedQuery}"`
            : '🔥 Trending This Week'}
        </h2>
        {debouncedQuery.length >= 2 && results.length > 0 && (
          <span className="text-xs text-text-muted">{results.length} results</span>
        )}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {debouncedQuery.length >= 2 && results.length === 0 && !isFetching ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-text-secondary">No shows found for "{debouncedQuery}"</p>
          </motion.div>
        ) : debouncedQuery.length >= 2 ? (
          <motion.div key="results" className="space-y-3">
            <AnimatePresence>
              {results.slice(0, 20).map((show) => (
                <SearchResultCard
                  key={show.id}
                  show={show}
                  isInList={watchlistIds.has(show.id)}
                  onAdd={handleAddShow}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="trending"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
          >
            {displayShows.slice(0, 18).map((show) => (
              <motion.div
                key={show.id}
                whileHover={{ scale: 1.04, y: -4 }}
                className="cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden aspect-[2/3] shadow-card mb-2 group">
                  {show.poster_path ? (
                    <img src={posterUrl(show.poster_path)} alt={show.name} className="poster-img group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-bg-tertiary flex items-center justify-center text-2xl">📺</div>
                  )}
                  {!watchlistIds.has(show.id) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddShow(show); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent-violet/80"
                    >
                      <Plus size={14} className="text-white" />
                    </button>
                  )}
                  {watchlistIds.has(show.id) && (
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-accent-green/80 flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <a href={`/show/${show.id}`} onClick={(e) => { e.preventDefault(); window.location.href = `/show/${show.id}`; }}>
                  <h4 className="text-xs font-semibold text-white truncate">{show.name}</h4>
                  <p className="text-[10px] text-text-muted">{show.first_air_date?.split('-')[0]}</p>
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
