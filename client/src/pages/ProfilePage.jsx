import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { showService } from '../services/showService';
import { listService } from '../services/listService';
import api from '../services/api';
import { posterUrl } from '../utils/tmdbImageUrl';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Heart } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const { data: lists = [] } = useQuery({
    queryKey: ['lists'],
    queryFn: () => listService.getLists(),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/stats').then((r) => r.data),
  });

  const favorites = watchlist.filter((s) => s.isFavorite);
  const watching = watchlist.filter((s) => s.status === 'watching');
  const allShows = watchlist.slice(0, 9);

  // Format TV time: total minutes → months, days, hours
  const totalMins = stats?.hoursWatched ? stats.hoursWatched * 60 : 0;
  const months = Math.floor(totalMins / (60 * 24 * 30));
  const days = Math.floor((totalMins % (60 * 24 * 30)) / (60 * 24));
  const hours = Math.floor((totalMins % (60 * 24)) / 60);

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Profile hero — show poster/backdrop as background */}
      <div className="profile-hero">
        {/* Background: blurred poster collage */}
        {watching.length > 0 && watching[0].showPoster ? (
          <img
            src={posterUrl(watching[0].showPoster)}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px) brightness(0.4)', transform: 'scale(1.1)' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#111' }} />
        )}

        {/* Bell + ... overlay */}
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F5C518', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: 3, padding: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
          </button>
        </div>

        {/* Avatar + name */}
        <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>{user?.displayName || user?.username}</h1>
            <button
              id="edit-profile-btn"
              style={{ marginTop: 4, padding: '3px 12px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.4)', background: 'none', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}
            >
              EDIT
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { val: user?.following || 0, label: 'following' },
          { val: user?.followers || 0, label: 'followers' },
          { val: user?.commentsCount || 0, label: 'comment' },
        ].map((item) => (
          <div key={item.label} className="stat-cell">
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{item.val}</span>
            <span style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Stats section */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 }}>Stats</h2>
          <Link to="/stats" style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={20} color="#888" />
          </Link>
        </div>
        <div className="scroll-x" style={{ display: 'flex', gap: 8 }}>
          {/* TV Time card */}
          <div style={{ flexShrink: 0, background: '#111', borderRadius: 8, padding: 14, minWidth: 160, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
              <span style={{ color: '#888', fontSize: 12 }}>TV time</span>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { val: months, label: 'MONTH' },
                { val: days, label: 'DAYS' },
                { val: hours, label: 'HOURS' },
              ].map((t) => (
                <div key={t.label} style={{ textAlign: 'center' }}>
                  <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: 0 }}>{t.val}</p>
                  <p style={{ color: '#888', fontSize: 10, marginTop: 2 }}>{t.label}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Episodes card */}
          <div style={{ flexShrink: 0, background: '#111', borderRadius: 8, padding: 14, minWidth: 120, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
              <span style={{ color: '#888', fontSize: 12 }}>Episodes</span>
            </div>
            <p style={{ color: '#fff', fontSize: 28, fontWeight: 900, margin: 0 }}>{(stats?.totalEpisodes || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Lists */}
      {lists.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 }}>Lists</h2>
            <Link to="/lists" style={{ display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={20} color="#888" />
            </Link>
          </div>
          <div className="scroll-x" style={{ display: 'flex', gap: 8 }}>
            {lists.map((list) => {
              const listPosters = watchlist
                .filter((w) => list.showIds.includes(w.tmdbShowId) && w.showPoster)
                .slice(0, 4)
                .map((w) => posterUrl(w.showPoster));

              return (
                <Link key={list._id} to={`/lists/${list._id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <div style={{ width: 160, height: 90, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#1a1a1a' }}>
                    {listPosters.length > 0 ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', gap: 1 }}>
                        {listPosters.map((p, i) => (
                          <img key={i} src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{list.emoji}</div>
                    )}
                    {/* Overlay label */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 8px 6px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{list.name}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Dots indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
            {lists.slice(0, 4).map((_, i) => (
              <div key={i} style={{ width: i === 0 ? 8 : 6, height: i === 0 ? 8 : 6, borderRadius: '50%', background: i === 0 ? '#F5C518' : '#444' }} />
            ))}
          </div>
        </div>
      )}

      {/* Shows section */}
      {allShows.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 }}>Shows</h2>
            <Link to="/library" style={{ display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={20} color="#888" />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {allShows.map((s) => {
              const poster = s.showPoster ? posterUrl(s.showPoster) : null;
              return (
                <div
                  key={s._id}
                  onClick={() => navigate(`/show/${s.tmdbShowId}`)}
                  style={{ borderRadius: 4, overflow: 'hidden', aspectRatio: '2/3', background: '#1a1a1a', cursor: 'pointer', position: 'relative' }}
                >
                  {poster ? (
                    <img src={poster} alt={s.showTitle} className="poster-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📺</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Favorite Shows */}
      {favorites.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E53935', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={14} fill="#fff" color="#fff" />
              </div>
              Favorite shows
            </h2>
            <ChevronRight size={20} color="#888" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {favorites.map((s) => {
              const poster = s.showPoster ? posterUrl(s.showPoster) : null;
              return (
                <div
                  key={s._id}
                  onClick={() => navigate(`/show/${s.tmdbShowId}`)}
                  style={{ borderRadius: 4, overflow: 'hidden', aspectRatio: '2/3', background: '#1a1a1a', cursor: 'pointer', position: 'relative' }}
                >
                  {poster ? (
                    <img src={poster} alt={s.showTitle} className="poster-img" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📺</div>
                  )}
                  {/* Purple progress bar */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#9C27B0' }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Movies placeholder */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 800, margin: 0 }}>Movies</h2>
          <ChevronRight size={20} color="#888" />
        </div>
        <div
          style={{ background: '#111', borderRadius: 8, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
          onClick={() => navigate('/explore')}
        >
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>+</div>
          <span style={{ color: '#888', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>ADD MOVIES</span>
        </div>
      </div>
    </div>
  );
}
