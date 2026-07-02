import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { showService } from '../services/showService';
import { posterUrl, backdropUrl, profileUrl } from '../utils/tmdbImageUrl';
import { formatMinutes, formatYear } from '../utils/formatTime';
import HeroBackdrop from '../components/show/HeroBackdrop';
import EpisodeRow from '../components/show/EpisodeRow';
import {
  ArrowLeft, Plus, Check, Star, Tv, Users, ChevronDown, List,
  Heart, MoreHorizontal, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

function SeasonSelector({ seasons, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const validSeasons = seasons.filter((s) => s.season_number > 0);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-accent-violet/40 transition-colors"
      >
        Season {selected}
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 glass-strong rounded-xl border border-surface-border z-50 overflow-hidden shadow-card w-48"
          >
            {validSeasons.map((s) => (
              <button
                key={s.season_number}
                onClick={() => { onSelect(s.season_number); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  selected === s.season_number
                    ? 'bg-accent-violet/20 text-accent-violet font-semibold'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-white'
                }`}
              >
                Season {s.season_number}
                <span className="text-text-muted text-xs ml-2">({s.episode_count} eps)</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tmdbId = parseInt(id);

  const [activeTab, setActiveTab] = useState('episodes');
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Fetch TMDb show data
  const { data: show, isLoading: showLoading } = useQuery({
    queryKey: ['tmdb-show', tmdbId],
    queryFn: () => showService.getTmdbShow(tmdbId),
  });

  // Fetch season episodes
  const { data: seasonData, isLoading: seasonLoading } = useQuery({
    queryKey: ['tmdb-season', tmdbId, selectedSeason],
    queryFn: () => showService.getTmdbSeason(tmdbId, selectedSeason),
    enabled: !!show,
  });

  // Fetch user's watchlist item for this show
  const { data: watchlistItem } = useQuery({
    queryKey: ['show-item', tmdbId],
    queryFn: () => showService.getShow(tmdbId).catch(() => null),
  });

  // Fetch progress (which episodes are watched)
  const { data: progress } = useQuery({
    queryKey: ['show-progress', tmdbId],
    queryFn: () => showService.getProgress(tmdbId),
    enabled: !!watchlistItem,
  });

  const watchedSet = progress?.watchedSet || {};

  // Season progress
  const seasonEpisodes = seasonData?.episodes || [];
  const seasonWatched = seasonEpisodes.filter(
    (ep) => watchedSet[`${selectedSeason}-${ep.episode_number}`]
  ).length;

  // Find next unwatched episode
  const nextEpisode = useMemo(() => {
    if (!seasonEpisodes.length) return null;
    return seasonEpisodes.find((ep) => !watchedSet[`${selectedSeason}-${ep.episode_number}`]);
  }, [seasonEpisodes, watchedSet, selectedSeason]);

  // Add to watchlist mutation
  const addMutation = useMutation({
    mutationFn: () => showService.addShow({
      tmdbShowId: tmdbId,
      showTitle: show.name,
      showPoster: show.poster_path,
      showBackdrop: show.backdrop_path,
      showYear: show.first_air_date?.split('-')[0],
      totalEpisodes: show.number_of_episodes,
      totalSeasons: show.number_of_seasons,
      genres: show.genres?.map((g) => g.name) || [],
      networks: show.networks?.map((n) => n.name) || [],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['show-item', tmdbId] });
      toast.success('Added to your list! 📺');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add show');
    },
  });

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: () => showService.removeShow(tmdbId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['show-item', tmdbId] });
      toast.success('Removed from list');
    },
  });

  // Watch episode — OPTIMISTIC UPDATE
  const watchMutation = useMutation({
    mutationFn: ({ season, episode, name, runtime, airDate }) =>
      showService.markWatched({
        tmdbShowId: tmdbId,
        season,
        episode,
        episodeName: name,
        runtime,
        airDate,
      }),
    onMutate: async ({ season, episode }) => {
      await queryClient.cancelQueries({ queryKey: ['show-progress', tmdbId] });
      const prev = queryClient.getQueryData(['show-progress', tmdbId]);
      queryClient.setQueryData(['show-progress', tmdbId], (old) => ({
        ...old,
        watchedSet: { ...(old?.watchedSet || {}), [`${season}-${episode}`]: { watchedAt: new Date() } },
        watchedCount: (old?.watchedCount || 0) + 1,
      }));
      return { prev };
    },
    onError: (err, vars, ctx) => {
      queryClient.setQueryData(['show-progress', tmdbId], ctx.prev);
      toast.error('Failed to mark episode');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['show-progress', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  // Unwatch episode — OPTIMISTIC UPDATE
  const unwatchMutation = useMutation({
    mutationFn: ({ season, episode }) =>
      showService.markUnwatched({ tmdbShowId: tmdbId, season, episode }),
    onMutate: async ({ season, episode }) => {
      await queryClient.cancelQueries({ queryKey: ['show-progress', tmdbId] });
      const prev = queryClient.getQueryData(['show-progress', tmdbId]);
      queryClient.setQueryData(['show-progress', tmdbId], (old) => {
        const newSet = { ...(old?.watchedSet || {}) };
        delete newSet[`${season}-${episode}`];
        return { ...old, watchedSet: newSet, watchedCount: Math.max(0, (old?.watchedCount || 0) - 1) };
      });
      return { prev };
    },
    onError: (err, vars, ctx) => {
      queryClient.setQueryData(['show-progress', tmdbId], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['show-progress', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const rewatchMutation = useMutation({
    mutationFn: ({ season, episode }) =>
      showService.markRewatched({ tmdbShowId: tmdbId, season, episode }),
    onSuccess: () => toast.success('Marked as rewatched! +1 🔁'),
  });

  const toggleFavorite = async () => {
    await showService.updateStatus(tmdbId, { isFavorite: !watchlistItem?.isFavorite });
    queryClient.invalidateQueries({ queryKey: ['show-item', tmdbId] });
    toast.success(watchlistItem?.isFavorite ? 'Removed from favorites' : 'Added to favorites ❤️');
  };

  if (showLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton w-full h-80 rounded-2xl" />
        <div className="skeleton w-64 h-8 rounded" />
        <div className="skeleton w-full h-12 rounded-xl" />
      </div>
    );
  }

  if (!show) return <div className="text-center py-20 text-text-muted">Show not found</div>;

  const cast = show.credits?.cast?.slice(0, 12) || [];
  const validSeasons = show.seasons?.filter((s) => s.season_number > 0) || [];

  return (
    <div className="space-y-8 -mt-8 -mx-6">
      {/* Hero backdrop */}
      <HeroBackdrop backdropPath={show.backdrop_path} title={show.name}>
        <div className="flex items-end gap-6 w-full">
          {/* Poster */}
          <div className="flex-shrink-0 w-36 h-52 rounded-xl overflow-hidden shadow-card border border-white/10">
            {show.poster_path ? (
              <img src={posterUrl(show.poster_path)} alt={show.name} className="poster-img" />
            ) : (
              <div className="w-full h-full bg-bg-tertiary flex items-center justify-center text-4xl">📺</div>
            )}
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black text-white leading-tight mb-2">{show.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm text-text-muted">{formatYear(show.first_air_date)}</span>
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1 text-sm text-accent-gold font-semibold">
                  <Star size={14} fill="currentColor" /> {show.vote_average.toFixed(1)}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-text-muted">
                <Tv size={14} /> {show.number_of_seasons} seasons
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {show.genres?.map((g) => (
                <span key={g.id} className="genre-tag">{g.name}</span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {!watchlistItem ? (
                <button
                  onClick={() => addMutation.mutate()}
                  disabled={addMutation.isPending}
                  className="btn-primary"
                >
                  <Plus size={16} /> Add to List
                </button>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-sm text-accent-green font-semibold">
                    <Check size={16} /> In your list
                  </span>
                  <button
                    onClick={toggleFavorite}
                    className={`btn-ghost ${watchlistItem?.isFavorite ? 'text-red-400' : 'text-text-muted'}`}
                  >
                    <Heart size={16} fill={watchlistItem?.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => removeMutation.mutate()}
                    className="btn-ghost text-red-400/70 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </HeroBackdrop>

      <div className="px-6 space-y-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Tabs */}
        <div className="flex gap-1 glass p-1 rounded-xl w-fit">
          {['about', 'episodes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-accent-violet text-white shadow-glow-violet'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* About tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Overview */}
              <div>
                <h3 className="font-bold text-white mb-2">Overview</h3>
                <p className="text-text-secondary leading-relaxed text-sm">{show.overview || 'No overview available.'}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {show.networks?.[0] && (
                  <div className="card p-4">
                    <p className="text-xs text-text-muted mb-1">Network</p>
                    <p className="font-semibold text-white text-sm">{show.networks[0].name}</p>
                  </div>
                )}
                <div className="card p-4">
                  <p className="text-xs text-text-muted mb-1">Episodes</p>
                  <p className="font-semibold text-white text-sm">{show.number_of_episodes}</p>
                </div>
                {show.episode_run_time?.[0] && (
                  <div className="card p-4">
                    <p className="text-xs text-text-muted mb-1">Runtime</p>
                    <p className="font-semibold text-white text-sm">{formatMinutes(show.episode_run_time[0])}</p>
                  </div>
                )}
                <div className="card p-4">
                  <p className="text-xs text-text-muted mb-1">Status</p>
                  <p className="font-semibold text-white text-sm">{show.status}</p>
                </div>
              </div>

              {/* Cast */}
              {cast.length > 0 && (
                <div>
                  <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                    <Users size={16} className="text-accent-violet" /> Cast
                  </h3>
                  <div className="flex gap-3 scroll-x pb-2">
                    {cast.map((person) => (
                      <div key={person.id} className="flex-shrink-0 w-20 text-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-bg-tertiary mx-auto mb-1.5 border border-surface-border">
                          {person.profile_path ? (
                            <img src={profileUrl(person.profile_path)} alt={person.name} className="poster-img" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                          )}
                        </div>
                        <p className="text-xs font-medium text-white truncate">{person.name}</p>
                        <p className="text-[10px] text-text-muted truncate">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Episodes tab */}
          {activeTab === 'episodes' && (
            <motion.div
              key="episodes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-4"
            >
              {/* Season selector + progress */}
              <div className="flex items-center justify-between">
                <SeasonSelector
                  seasons={validSeasons}
                  selected={selectedSeason}
                  onSelect={setSelectedSeason}
                />
                <div className="flex items-center gap-3">
                  {/* Season progress */}
                  <div className="text-sm text-text-muted">
                    <span className="font-bold text-white">{seasonWatched}</span>/{seasonEpisodes.length} watched
                  </div>
                  {seasonEpisodes.length > 0 && seasonWatched < seasonEpisodes.length && (
                    <button
                      onClick={() => {
                        const unwatched = seasonEpisodes.filter(
                          (ep) => !watchedSet[`${selectedSeason}-${ep.episode_number}`]
                        );
                        unwatched.forEach((ep) => {
                          watchMutation.mutate({
                            season: selectedSeason,
                            episode: ep.episode_number,
                            name: ep.name,
                            runtime: ep.runtime,
                            airDate: ep.air_date,
                          });
                        });
                        toast.success(`Marked all ${unwatched.length} episodes!`);
                      }}
                      className="text-xs btn-ghost text-accent-violet border border-accent-violet/30"
                    >
                      Mark all watched
                    </button>
                  )}
                </div>
              </div>

              {/* Season progress bar */}
              <div className="progress-bar" style={{ height: 4 }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${seasonEpisodes.length ? (seasonWatched / seasonEpisodes.length) * 100 : 0}%` }}
                />
              </div>

              {/* Episode list */}
              {seasonLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {seasonEpisodes.map((ep) => {
                    const key = `${selectedSeason}-${ep.episode_number}`;
                    const epData = watchedSet[key];
                    const isWatched = !!epData;
                    const isNext = nextEpisode?.episode_number === ep.episode_number;

                    return (
                      <EpisodeRow
                        key={ep.id}
                        episode={ep}
                        showId={tmdbId}
                        season={selectedSeason}
                        isWatched={isWatched}
                        isNext={!isWatched && isNext}
                        rewatchCount={epData?.rewatchCount || 0}
                        onWatch={(s, e, name, runtime, airDate) =>
                          watchMutation.mutate({ season: s, episode: e, name, runtime, airDate })
                        }
                        onUnwatch={(s, e) => unwatchMutation.mutate({ season: s, episode: e })}
                        onRewatch={(s, e) => rewatchMutation.mutate({ season: s, episode: e })}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
