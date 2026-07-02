import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { showService } from '../services/showService';
import ShowCard from '../components/show/ShowCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

const STATUS_TABS = [
  { label: 'All', value: null },
  { label: 'Watching', value: 'watching' },
  { label: 'Watch Later', value: 'watchlist' },
  { label: 'Up To Date', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Dropped', value: 'dropped' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

export default function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || null;
  const [activeStatus, setActiveStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState('lastWatchedAt');
  const [search, setSearch] = useState('');

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const filtered = watchlist
    .filter((s) => (!activeStatus || s.status === activeStatus))
    .filter((s) => !search || s.showTitle.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'lastWatchedAt') return new Date(b.lastWatchedAt || b.addedAt) - new Date(a.lastWatchedAt || a.addedAt);
      if (sortBy === 'title') return a.showTitle.localeCompare(b.showTitle);
      if (sortBy === 'addedAt') return new Date(b.addedAt) - new Date(a.addedAt);
      return 0;
    });

  const handleTabChange = (val) => {
    setActiveStatus(val);
    if (val) {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">My Library</h1>
          <p className="text-text-muted text-sm">{watchlist.length} shows tracked</p>
        </div>
        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg-tertiary border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-violet"
          >
            <option value="lastWatchedAt">Recently Watched</option>
            <option value="addedAt">Recently Added</option>
            <option value="title">A-Z</option>
          </select>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 scroll-x pb-1">
        {STATUS_TABS.map((tab) => {
          const count = tab.value ? watchlist.filter((s) => s.status === tab.value).length : watchlist.length;
          return (
            <button
              key={tab.value || 'all'}
              onClick={() => handleTabChange(tab.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                activeStatus === tab.value
                  ? 'bg-accent-violet/20 text-accent-violet border-accent-violet/40'
                  : 'text-text-muted border-surface-border hover:bg-surface-hover hover:text-white'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
                activeStatus === tab.value ? 'bg-accent-violet/30' : 'bg-white/5'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search within library */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter by name..."
        className="input-field"
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton aspect-[2/3] rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-text-muted">
            {search ? `No shows matching "${search}"` : 'No shows in this category yet'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStatus || 'all'}
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
          >
            {filtered.map((s) => (
              <motion.div key={s._id} variants={item}>
                <ShowCard item={s} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
