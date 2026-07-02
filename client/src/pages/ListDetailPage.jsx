import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { listService } from '../services/listService';
import { showService } from '../services/showService';
import ShowCard from '../components/show/ShowCard';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddSearch, setShowAddSearch] = useState(false);

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => listService.getLists(),
  });

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const list = lists.find((l) => l._id === id);
  const showsInList = watchlist.filter((w) => list?.showIds?.includes(w.tmdbShowId));
  const showsNotInList = watchlist.filter((w) => !list?.showIds?.includes(w.tmdbShowId));

  const removeMutation = useMutation({
    mutationFn: (tmdbId) => listService.removeShowFromList(id, tmdbId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Removed from list');
    },
  });

  const addMutation = useMutation({
    mutationFn: (show) => listService.addShowToList(id, show.tmdbShowId, show.showPoster),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      toast.success('Added to list!');
      setShowAddSearch(false);
    },
  });

  if (!list) return <div className="text-center py-20 text-text-muted">List not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/lists')} className="btn-ghost text-text-muted">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-3xl">{list.emoji}</span> {list.name}
          </h1>
          <p className="text-text-muted text-sm">{list.showIds.length} shows</p>
        </div>
        <button onClick={() => setShowAddSearch((p) => !p)} className="btn-primary">
          <Plus size={16} /> Add Shows
        </button>
      </div>

      {/* Add from watchlist panel */}
      {showAddSearch && showsNotInList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-text-secondary">Add from your watchlist:</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {showsNotInList.map((show) => (
              <motion.button
                key={show._id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addMutation.mutate(show)}
                className="group relative"
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-bg-tertiary">
                  {show.showPoster ? (
                    <img src={`https://image.tmdb.org/t/p/w185${show.showPoster}`} alt={show.showTitle} className="poster-img" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm">📺</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Plus size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-[10px] text-text-muted mt-1 truncate">{show.showTitle}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Shows in list */}
      {showsInList.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-4xl mb-3">{list.emoji}</div>
          <p className="text-text-muted">No shows in this list yet.</p>
          <button onClick={() => setShowAddSearch(true)} className="btn-primary mt-4">
            <Plus size={16} /> Add Shows
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {showsInList.map((show) => (
            <div key={show._id} className="group relative">
              <ShowCard item={show} />
              <button
                onClick={() => removeMutation.mutate(show.tmdbShowId)}
                className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <Trash2 size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
