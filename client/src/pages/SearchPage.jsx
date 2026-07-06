import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';
import { useNavigate } from 'react-router-dom';
import { Plus, Check } from 'lucide-react';
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
  const navigate = useNavigate();
  const poster = show.poster_path ? posterUrl(show.poster_path) : null;

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (isInList || adding) return;
    setAdding(true);
    try {
      await onAdd(show);
      toast.success(`${show.name} added!`);
    } catch {
      toast.error('Failed to add');
    } finally {
      setAdding(false);
    }
  };

  const isTV = show.media_type !== 'movie' || show.first_air_date;

  return (
    <div
      onClick={() => navigate(`/show/${show.id}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
      }}
    >
      {/* Poster */}
      <div style={{ flexShrink: 0, width: 48, height: 64, borderRadius: 4, overflow: 'hidden', background: '#1a1a1a' }}>
        {poster ? (
          <img src={poster} alt={show.name} className="poster-img" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📺</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#fff', fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {show.name || show.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          {isTV ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/></svg>
          )}
          <span style={{ color: '#888', fontSize: 12 }}>
            {show.vote_count?.toLocaleString() || 0} added this {isTV ? 'show' : 'movie'}
          </span>
        </div>
      </div>

      {/* Add button — yellow square */}
      <button
        onClick={handleAdd}
        className="btn-add"
        aria-label={isInList ? 'Added' : 'Add to list'}
        style={{ borderColor: isInList ? '#4CAF50' : '#F5C518', color: isInList ? '#4CAF50' : '#F5C518' }}
      >
        {adding ? (
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            style={{ width: 14, height: 14, border: '2px solid rgba(245,197,24,0.3)', borderTopColor: '#F5C518', borderRadius: '50%' }} />
        ) : isInList ? (
          <Check size={16} />
        ) : (
          <Plus size={18} />
        )}
      </button>
    </div>
  );
}

const EXPLORE_TABS = ['FEED', 'DISCOVER', 'GROUPS', 'ACTIVITY'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchTab, setSearchTab] = useState('SHOWS & MOVIES');
  const [exploreTab, setExploreTab] = useState('FEED');
  const debouncedQuery = useDebounce(query, 400);
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
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Search bar */}
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchActive(true); }}
            onFocus={() => setSearchActive(true)}
            placeholder="Search shows and movies..."
            className="search-input"
            style={{ paddingBottom: 12 }}
          />
          {isFetching && (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#F5C518', borderRadius: '50%', flexShrink: 0 }} />
          )}
        </div>
        {searchActive && (
          <button
            onClick={() => { setQuery(''); setSearchActive(false); }}
            style={{ background: 'none', border: 'none', color: '#2196F3', fontSize: 15, fontWeight: 600, cursor: 'pointer', paddingBottom: 12 }}
          >
            Cancel
          </button>
        )}
      </div>

      {searchActive && query.length >= 2 ? (
        /* Search results view */
        <div>
          {/* Sub-tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 16px' }}>
            {['SHOWS & MOVIES', 'USERS', 'GROUPS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchTab(tab)}
                className="search-tab"
                style={{
                  color: searchTab === tab ? '#fff' : '#555',
                  borderBottom: searchTab === tab ? '2px solid #fff' : '2px solid transparent',
                  padding: '10px 0',
                  marginRight: 16,
                  flex: 'none',
                  fontSize: 11,
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Results */}
          {results.length === 0 && !isFetching ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <p style={{ color: '#888', fontSize: 15 }}>No results for "{query}"</p>
            </div>
          ) : (
            <div>
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
        /* Explore default view */
        <div>
          {/* Explore tabs */}
          <div className="scroll-x" style={{ display: 'flex', gap: 8, padding: '14px 16px 0' }}>
            {EXPLORE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setExploreTab(tab)}
                style={{
                  flexShrink: 0,
                  padding: '8px 18px',
                  borderRadius: 50,
                  border: 'none',
                  background: exploreTab === tab ? '#F5C518' : 'rgba(255,255,255,0.1)',
                  color: exploreTab === tab ? '#000' : '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Trending shows grid */}
          <div style={{ padding: '16px 16px 0' }}>
            {(trending?.results || []).slice(0, 6).map((show) => (
              <div
                key={show.id}
                onClick={() => navigate(`/show/${show.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
              >
                <div style={{ width: 48, height: 64, borderRadius: 4, overflow: 'hidden', background: '#1a1a1a', flexShrink: 0 }}>
                  {show.poster_path ? (
                    <img src={posterUrl(show.poster_path)} alt={show.name} className="poster-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📺</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{show.name || show.title}</p>
                  <p style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{show.vote_count?.toLocaleString()} added this show</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddShow(show); }}
                  className="btn-add"
                  style={{ borderColor: watchlistIds.has(show.id) ? '#4CAF50' : '#F5C518', color: watchlistIds.has(show.id) ? '#4CAF50' : '#F5C518' }}
                >
                  {watchlistIds.has(show.id) ? <Check size={16} /> : <Plus size={18} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
