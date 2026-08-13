import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchResultRow({ show, isInList, onAdd }) {
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const poster = show.poster_path ? posterUrl(show.poster_path) : null;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isInList || adding) return;
    setAdding(true);
    try {
      await onAdd(show);
      toast.success(`${show.name || show.title} added!`);
    } catch {
      toast.error('Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const isTV = show.media_type !== 'movie' || show.first_air_date;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/show/${show.id}`)}
      className="glass-panel p-3 flex items-center gap-3.5 mb-2.5 cursor-pointer hover:border-[#FFD500]/40 transition-all hover:shadow-[0_4px_20px_rgba(255,213,0,0.1)] group"
    >
      {/* Poster Thumbnail */}
      <div className="w-14 h-20 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 relative border border-white/10 group-hover:border-[#FFD500]/30">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={show.name || show.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-1 text-center">
            <span className="text-xl">📺</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-extrabold text-white truncate group-hover:text-[#FFD500] transition-colors">
          {show.name || show.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-white/10 text-[10px] font-bold text-slate-300">
            {isTV ? 'TV Series' : 'Movie'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {(show.first_air_date || show.release_date)?.split('-')[0] || 'Unknown'}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 line-clamp-1">
          {show.overview || `${show.vote_count?.toLocaleString() || 0} users tracking this`}
        </p>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        className={`btn-add ${isInList ? '!border-[#10B981] !color-[#10B981] bg-[#10B981]/10' : ''}`}
        aria-label={isInList ? 'Added' : 'Add to list'}
      >
        {adding ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-[#FFD500]/30 border-t-[#FFD500] rounded-full"
          />
        ) : isInList ? (
          <Check size={18} className="text-[#10B981]" />
        ) : (
          <Plus size={20} className="text-[#FFD500]" />
        )}
      </button>
    </motion.div>
  );
}

const EXPLORE_TABS = ['DISCOVER', 'TRENDING', 'RECOMMENDED'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [exploreTab, setExploreTab] = useState('DISCOVER');
  const debouncedQuery = useDebounce(query, 300);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
      showTitle: show.name || show.title,
      showPoster: show.poster_path,
      showBackdrop: show.backdrop_path,
      showYear: (show.first_air_date || show.release_date)?.split('-')[0],
    });
    queryClient.invalidateQueries({ queryKey: ['watchlist'] });
  };

  const results = searchData?.results || [];

  return (
    <div className="space-y-6 min-h-screen">
      {/* Search Input Bar */}
      <div className="glass-panel p-2 flex items-center gap-3">
        <Search size={20} className="text-[#FFD500] ml-3 flex-shrink-0" />
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearchActive(true); }}
          onFocus={() => setSearchActive(true)}
          placeholder="Search TV shows, movies, anime..."
          className="w-full bg-transparent text-white placeholder-slate-400 outline-none text-base py-2 font-medium"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSearchActive(false); }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors mr-2"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {searchActive && query.length >= 2 ? (
        /* Results View */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Search Results for "{query}"
            </span>
            {isFetching && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-[#FFD500]/30 border-t-[#FFD500] rounded-full"
              />
            )}
          </div>

          {results.length === 0 && !isFetching ? (
            <div className="glass-panel text-center py-16 px-6">
              <span className="text-5xl block mb-3">🔍</span>
              <p className="text-white font-bold text-lg mb-1">No shows found</p>
              <p className="text-slate-400 text-sm">Try checking your spelling or searching for a different title.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.slice(0, 20).map((show) => (
                <SearchResultRow
                  key={show.id}
                  show={show}
                  isInList={watchlistIds.has(show.id)}
                  onAdd={handleAddShow}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Explore Section */
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scroll-x">
            {EXPLORE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setExploreTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-extrabold tracking-wider transition-all flex-shrink-0 ${exploreTab === tab
                    ? 'bg-[#FFD500] text-[#0A0A0F] shadow-[0_4px_16px_rgba(255,213,0,0.3)] scale-105'
                    : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:border-white/20'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Trending Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="section-pill">
                🔥 TRENDING TV SHOWS
              </span>
            </div>

            <div className="space-y-2.5">
              {(trending?.results || []).map((show) => (
                <SearchResultRow
                  key={show.id}
                  show={show}
                  isInList={watchlistIds.has(show.id)}
                  onAdd={handleAddShow}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

