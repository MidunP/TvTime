import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listService } from '../services/listService';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';
import { Plus, Trash2, Edit3, X, Check, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function ListCollage({ posterUrls, name }) {
  const filled = [...posterUrls, null, null, null, null].slice(0, 4);
  return (
    <div className="collage-grid aspect-[1/1] rounded-xl overflow-hidden mb-3 bg-bg-tertiary">
      {filled.map((url, i) => (
        <div key={i} className="overflow-hidden">
          {url ? (
            <img src={url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-bg-secondary flex items-center justify-center text-lg">📺</div>
          )}
        </div>
      ))}
    </div>
  );
}

function CreateListModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📺');
  const [isPrivate, setIsPrivate] = useState(false);

  const EMOJIS = ['📺', '🎬', '⭐', '🔥', '💜', '🎭', '😂', '🦸', '🧙', '🌙', '🎵', '💀'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name, emoji, isPrivate });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-2xl p-6 w-full max-w-sm shadow-card"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white text-lg">Create New List</h3>
          <button onClick={onClose} className="text-text-muted hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-text-muted mb-2 block">Choose an emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    emoji === e ? 'bg-accent-violet/30 border border-accent-violet/60' : 'bg-bg-tertiary hover:bg-surface-hover'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-text-muted mb-2 block">List name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Comfort Shows, Sitcoms..."
              className="input-field"
              maxLength={50}
              autoFocus
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsPrivate((p) => !p)}
              className={`w-10 h-5 rounded-full transition-colors relative ${isPrivate ? 'bg-accent-violet' : 'bg-bg-tertiary border border-surface-border'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${isPrivate ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-text-secondary flex items-center gap-1">
              {isPrivate && <Lock size={13} />} Private list
            </span>
          </label>

          <button type="submit" className="btn-primary w-full">
            Create List
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ListsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['lists'],
    queryFn: () => listService.getLists(),
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => listService.createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('List created! 🎉');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => listService.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('List deleted');
    },
  });

  // Build poster cache for lists using watchlist data
  const getListPosters = (list) => {
    if (list.posterCache?.length > 0) return list.posterCache.map((p) => `https://image.tmdb.org/t/p/w185${p}`);
    const matched = watchlist
      .filter((w) => list.showIds.includes(w.tmdbShowId) && w.showPoster)
      .slice(0, 4)
      .map((w) => posterUrl(w.showPoster));
    return matched;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">My Lists</h1>
          <p className="text-text-muted text-sm">{lists.length} custom lists</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={16} /> New List
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-xl" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="py-24 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-bold text-white mb-2">No lists yet</h3>
          <p className="text-text-muted mb-6">Create custom collections like "Sitcoms", "Comfort Shows", "Anime" etc.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create Your First List</button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {lists.map((list) => (
            <motion.div
              key={list._id}
              whileHover={{ scale: 1.02, y: -3 }}
              className="group cursor-pointer"
            >
              <Link to={`/lists/${list._id}`}>
                <ListCollage posterUrls={getListPosters(list)} name={list.name} />
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-1">
                      {list.emoji} {list.name}
                      {list.isPrivate && <Lock size={11} className="text-text-muted" />}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">{list.showIds.length} shows</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm(`Delete "${list.name}"?`)) deleteMutation.mutate(list._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/60 hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateListModal
            onClose={() => setShowCreate(false)}
            onCreate={(data) => createMutation.mutate(data)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
