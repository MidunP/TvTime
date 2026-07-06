import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { showService } from '../services/showService';
import { posterUrl, backdropUrl, profileUrl } from '../utils/tmdbImageUrl';
import { formatMinutes, formatYear } from '../utils/formatTime';
import EpisodeRow from '../components/show/EpisodeRow';
import { ArrowLeft, Plus, Check, Star, Tv, Users, ChevronDown, ChevronUp, MoreHorizontal, Heart, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Status bar color for the show
const STATUS_BAR = {
  watching:   '#F5C518',
  watchlist:  '#2196F3',
  completed:  '#4CAF50',
  paused:     '#FF9800',
  dropped:    '#E53935',
  rewatching: '#9C27B0',
};

function SeasonAccordion({ season, episodes, watchedSet, selectedSeason, onToggle, isOpen, onWatch, onUnwatch, onRewatch, tmdbId }) {
  const seasonWatched = episodes.filter((ep) => watchedSet[`${season.season_number}-${ep.episode_number}`]).length;
  const total = episodes.length;
  const pct = total > 0 ? (seasonWatched / total) * 100 : 0;

  return (
    <div>
      {/* Season header row */}
      <div className="season-row" onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>Season {season.season_number}</span>
          {isOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#888', fontSize: 13 }}>{seasonWatched}/{total}</span>
          {/* Check circle */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `2px solid ${seasonWatched === total && total > 0 ? '#4CAF50' : 'rgba(255,255,255,0.2)'}`,
            background: seasonWatched === total && total > 0 ? '#4CAF50' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {seasonWatched === total && total > 0 && <Check size={14} color="#fff" strokeWidth={3} />}
          </div>
        </div>
      </div>
      {/* Yellow progress bar under season header */}
      <div style={{ height: 3, background: '#222' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#F5C518', transition: 'width 0.3s ease' }} />
      </div>

      {/* Episodes */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {episodes.map((ep) => {
              const key = `${season.season_number}-${ep.episode_number}`;
              const epData = watchedSet[key];
              const isWatched = !!epData;
              return (
                <EpisodeRow
                  key={ep.id}
                  episode={ep}
                  showId={tmdbId}
                  season={season.season_number}
                  isWatched={isWatched}
                  isNext={false}
                  rewatchCount={epData?.rewatchCount || 0}
                  onWatch={(s, e, name, runtime, airDate) => onWatch({ season: s, episode: e, name, runtime, airDate })}
                  onUnwatch={(s, e) => onUnwatch({ season: s, episode: e })}
                  onRewatch={(s, e) => onRewatch({ season: s, episode: e })}
                />
              );
            })}
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
  const [openSeasons, setOpenSeasons] = useState({ 1: true });
  const [seasonEpisodesCache, setSeasonEpisodesCache] = useState({});

  const { data: show, isLoading: showLoading } = useQuery({
    queryKey: ['tmdb-show', tmdbId],
    queryFn: () => showService.getTmdbShow(tmdbId),
  });

  const { data: watchlistItem } = useQuery({
    queryKey: ['show-item', tmdbId],
    queryFn: () => showService.getShow(tmdbId).catch(() => null),
  });

  const { data: progress } = useQuery({
    queryKey: ['show-progress', tmdbId],
    queryFn: () => showService.getProgress(tmdbId),
    enabled: !!watchlistItem,
  });

  const watchedSet = progress?.watchedSet || {};

  // Fetch episodes for open seasons
  const openSeasonNums = Object.keys(openSeasons).filter((k) => openSeasons[k]).map(Number);

  // Pre-fetch season 1 episodes
  const { data: season1Data } = useQuery({
    queryKey: ['tmdb-season', tmdbId, 1],
    queryFn: () => showService.getTmdbSeason(tmdbId, 1),
    enabled: !!show,
  });

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
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add show'),
  });

  const removeMutation = useMutation({
    mutationFn: () => showService.removeShow(tmdbId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['show-item', tmdbId] });
      toast.success('Removed from list');
    },
  });

  const watchMutation = useMutation({
    mutationFn: ({ season, episode, name, runtime, airDate }) =>
      showService.markWatched({ tmdbShowId: tmdbId, season, episode, episodeName: name, runtime, airDate }),
    onMutate: async ({ season, episode }) => {
      await queryClient.cancelQueries({ queryKey: ['show-progress', tmdbId] });
      const prev = queryClient.getQueryData(['show-progress', tmdbId]);
      queryClient.setQueryData(['show-progress', tmdbId], (old) => ({
        ...old,
        watchedSet: { ...(old?.watchedSet || {}), [`${season}-${episode}`]: { watchedAt: new Date() } },
      }));
      return { prev };
    },
    onError: (err, vars, ctx) => queryClient.setQueryData(['show-progress', tmdbId], ctx.prev),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['show-progress', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const unwatchMutation = useMutation({
    mutationFn: ({ season, episode }) => showService.markUnwatched({ tmdbShowId: tmdbId, season, episode }),
    onMutate: async ({ season, episode }) => {
      await queryClient.cancelQueries({ queryKey: ['show-progress', tmdbId] });
      const prev = queryClient.getQueryData(['show-progress', tmdbId]);
      queryClient.setQueryData(['show-progress', tmdbId], (old) => {
        const newSet = { ...(old?.watchedSet || {}) };
        delete newSet[`${season}-${episode}`];
        return { ...old, watchedSet: newSet };
      });
      return { prev };
    },
    onError: (err, vars, ctx) => queryClient.setQueryData(['show-progress', tmdbId], ctx.prev),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['show-progress', tmdbId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const rewatchMutation = useMutation({
    mutationFn: ({ season, episode }) => showService.markRewatched({ tmdbShowId: tmdbId, season, episode }),
    onSuccess: () => toast.success('Marked as rewatched! 🔁'),
  });

  const toggleFavorite = async () => {
    await showService.updateStatus(tmdbId, { isFavorite: !watchlistItem?.isFavorite });
    queryClient.invalidateQueries({ queryKey: ['show-item', tmdbId] });
    toast.success(watchlistItem?.isFavorite ? 'Removed from favorites' : 'Added to favorites ❤️');
  };

  if (showLoading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div className="skeleton" style={{ height: 280 }} />
        <div style={{ padding: '16px' }}>
          <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 8 }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72, marginBottom: 4 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!show) return <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>Show not found</div>;

  const validSeasons = show.seasons?.filter((s) => s.season_number > 0) || [];
  const cast = show.credits?.cast?.slice(0, 12) || [];
  const barColor = STATUS_BAR[watchlistItem?.status] || '#F5C518';

  // Overall progress
  const totalWatched = Object.keys(watchedSet).length;
  const totalEps = show.number_of_episodes || 1;
  const overallPct = Math.min(100, (totalWatched / totalEps) * 100);

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero backdrop */}
      <div className="show-hero">
        {show.backdrop_path ? (
          <img
            src={backdropUrl(show.backdrop_path)}
            alt={show.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#111' }} />
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)',
        }} />
        {/* Back + more */}
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            id="back-btn"
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronDown size={20} color="#fff" />
          </button>
          <button
            id="more-btn"
            style={{ width: 36, height: 36, background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <MoreHorizontal size={20} color="#fff" />
            <span style={{ color: '#fff', fontSize: 20, letterSpacing: 2 }}></span>
          </button>
        </div>
        {/* Title at bottom of hero */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 16px 12px' }}>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{show.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ color: '#ccc', fontSize: 12 }}>
              {show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''} • {show.status} • {show.networks?.[0]?.name}
            </span>
            {show.vote_average > 0 && (
              <span style={{ color: '#F5C518', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#F5C518"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {(show.vote_average * 10).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Yellow progress bar */}
      <div style={{ height: 3, background: '#222' }}>
        <div style={{ height: '100%', width: `${overallPct}%`, background: barColor, transition: 'width 0.5s ease' }} />
      </div>

      {/* Action buttons row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {!watchlistItem ? (
          <button
            id="add-btn"
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending}
            className="btn-yellow"
            style={{ flex: 1, padding: '10px 0' }}
          >
            <Plus size={16} style={{ marginRight: 6 }} /> ADD TO LIST
          </button>
        ) : (
          <>
            <button
              onClick={toggleFavorite}
              style={{ padding: '8px 16px', borderRadius: 50, border: `1px solid rgba(255,255,255,0.15)`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: watchlistItem?.isFavorite ? '#E53935' : '#fff', fontSize: 13 }}
            >
              <Heart size={16} fill={watchlistItem?.isFavorite ? 'currentColor' : 'none'} />
              {watchlistItem?.isFavorite ? 'Favorited' : 'Favorite'}
            </button>
            <button
              onClick={() => removeMutation.mutate()}
              style={{ padding: '8px 16px', borderRadius: 50, border: '1px solid rgba(255,0,0,0.3)', background: 'none', cursor: 'pointer', color: '#E53935', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </>
        )}
      </div>

      {/* ABOUT / EPISODES tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {['about', 'episodes'].map((tab) => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className="top-tab"
            style={{
              color: activeTab === tab ? '#fff' : '#555',
              borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
              textTransform: 'uppercase',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ padding: 16 }}
          >
            {show.overview && (
              <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{show.overview}</p>
            )}

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {[
                { label: 'Network', val: show.networks?.[0]?.name },
                { label: 'Episodes', val: show.number_of_episodes },
                { label: 'Runtime', val: show.episode_run_time?.[0] ? formatMinutes(show.episode_run_time[0]) : null },
                { label: 'Status', val: show.status },
                { label: 'First Air', val: show.first_air_date?.split('-')[0] },
                { label: 'Language', val: show.original_language?.toUpperCase() },
              ].filter((d) => d.val).map(({ label, val }) => (
                <div key={label} style={{ background: '#111', borderRadius: 8, padding: '10px 12px' }}>
                  <p style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</p>
                  <p style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{val}</p>
                </div>
              ))}
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div>
                <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Cast</h3>
                <div className="scroll-x" style={{ display: 'flex', gap: 12, paddingBottom: 8 }}>
                  {cast.map((person) => (
                    <div key={person.id} style={{ flexShrink: 0, width: 64, textAlign: 'center' }}>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#1a1a1a', margin: '0 auto 6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {person.profile_path ? (
                          <img src={profileUrl(person.profile_path)} alt={person.name} className="poster-img" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
                        )}
                      </div>
                      <p style={{ color: '#fff', fontSize: 10, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name}</p>
                      <p style={{ color: '#555', fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'episodes' && (
          <motion.div
            key="episodes"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {validSeasons.map((season) => {
              const isOpen = !!openSeasons[season.season_number];

              return (
                <SeasonWithData
                  key={season.season_number}
                  season={season}
                  tmdbId={tmdbId}
                  isOpen={isOpen}
                  watchedSet={watchedSet}
                  onToggle={() => setOpenSeasons((prev) => ({ ...prev, [season.season_number]: !prev[season.season_number] }))}
                  onWatch={watchMutation.mutate}
                  onUnwatch={unwatchMutation.mutate}
                  onRewatch={rewatchMutation.mutate}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component that fetches episodes for a season lazily
function SeasonWithData({ season, tmdbId, isOpen, watchedSet, onToggle, onWatch, onUnwatch, onRewatch }) {
  const { data: seasonData, isLoading } = useQuery({
    queryKey: ['tmdb-season', tmdbId, season.season_number],
    queryFn: () => showService.getTmdbSeason(tmdbId, season.season_number),
    enabled: isOpen,
  });

  const episodes = seasonData?.episodes || [];
  const seasonWatched = episodes.filter((ep) => watchedSet[`${season.season_number}-${ep.episode_number}`]).length;
  const total = season.episode_count || episodes.length;
  const pct = total > 0 ? (seasonWatched / total) * 100 : 0;

  return (
    <div>
      {/* Season header */}
      <div className="season-row" onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>
            Season {season.season_number}
          </span>
          {isOpen ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#888', fontSize: 13 }}>{seasonWatched}/{total}</span>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: `2px solid ${seasonWatched === total && total > 0 ? '#4CAF50' : 'rgba(255,255,255,0.2)'}`,
            background: seasonWatched === total && total > 0 ? '#4CAF50' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {seasonWatched === total && total > 0 && <Check size={14} color="#fff" strokeWidth={3} />}
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 3, background: '#222' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: '#F5C518', transition: 'width 0.4s ease' }} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 72, margin: '2px 0' }} />
              ))
            ) : (
              episodes.map((ep) => {
                const key = `${season.season_number}-${ep.episode_number}`;
                const epData = watchedSet[key];
                return (
                  <EpisodeRow
                    key={ep.id}
                    episode={ep}
                    showId={tmdbId}
                    season={season.season_number}
                    isWatched={!!epData}
                    isNext={false}
                    rewatchCount={epData?.rewatchCount || 0}
                    onWatch={(s, e, name, runtime, airDate) => onWatch({ season: s, episode: e, name, runtime, airDate })}
                    onUnwatch={(s, e) => onUnwatch({ season: s, episode: e })}
                    onRewatch={(s, e) => onRewatch({ season: s, episode: e })}
                  />
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
