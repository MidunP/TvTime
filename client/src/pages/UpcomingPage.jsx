import { useQuery } from '@tanstack/react-query';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function UpcomingPage() {
  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  // Get shows that are actively being watched
  const activeShows = watchlist.filter((s) => ['watching', 'watchlist', 'paused'].includes(s.status));

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }}>
        {/* Top tabs skeleton */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ flex: 1, padding: '12px 0', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: 14, width: 80, margin: '0 auto' }} />
          </div>
          <div style={{ flex: 1, padding: '12px 0', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: 14, width: 80, margin: '0 auto' }} />
          </div>
        </div>
        <div style={{ padding: 16 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, marginBottom: 4, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Top tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Link
          to="/"
          className="top-tab"
          style={{ color: '#555', borderBottom: '2px solid transparent', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          WATCH LIST
        </Link>
        <button
          className="top-tab active"
          style={{ color: '#fff', borderBottom: '2px solid #fff' }}
        >
          UPCOMING
        </button>
      </div>

      {/* Grid toggle */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px 6px' }}>
        <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </button>
      </div>

      {activeShows.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📅</div>
          <p style={{ color: '#888', fontSize: 15 }}>No upcoming episodes</p>
          <p style={{ color: '#555', fontSize: 13, marginTop: 8 }}>Add shows to your watchlist to track upcoming episodes</p>
        </div>
      ) : (
        <div>
          {/* Group by status label */}
          {/* Currently watching → show as MONDAY (today's) */}
          {activeShows.filter((s) => s.status === 'watching').length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
                <span className="section-pill">WATCHING NOW</span>
              </div>
              {activeShows.filter((s) => s.status === 'watching').map((show) => (
                <UpcomingCard key={show._id} show={show} daysAgo="IN PROGRESS" countdown={null} />
              ))}
            </>
          )}

          {/* Watchlist → LATER */}
          {activeShows.filter((s) => s.status === 'watchlist').length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
                <span className="section-pill">LATER</span>
              </div>
              {activeShows.filter((s) => s.status === 'watchlist').map((show, i) => (
                <UpcomingCard key={show._id} show={show} daysAgo={null} countdown={i + 1} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function UpcomingCard({ show, daysAgo, countdown }) {
  const navigate = useNavigate();
  const poster = show.showPoster ? posterUrl(show.showPoster) : null;

  return (
    <div
      onClick={() => navigate(`/show/${show.tmdbShowId}`)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: '#111',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        cursor: 'pointer',
      }}
    >
      {/* Poster thumbnail */}
      <div style={{ flexShrink: 0, width: 80, height: 56, borderRadius: 4, overflow: 'hidden', background: '#1a1a1a' }}>
        {poster ? (
          <img src={poster} alt={show.showTitle} className="poster-img" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📺</div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Show name pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50, marginBottom: 6 }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{show.showTitle.toUpperCase()}</span>
          <ChevronRight size={10} color="#888" />
        </div>
        {/* Episode info */}
        <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
          S{String(show.currentSeason || 1).padStart(2, '0')} | E{String((show.currentEpisode || 0) + 1).padStart(2, '0')}
        </p>
        <p style={{ color: '#888', fontSize: 12 }}>TBA</p>
        {/* LATEST badge */}
        <span className="badge-latest" style={{ marginTop: 4, display: 'inline-block' }}>LATEST</span>
      </div>

      {/* Right: countdown or time */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        {daysAgo ? (
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{daysAgo}</span>
        ) : countdown ? (
          <div>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{countdown}</span>
            <p style={{ color: '#888', fontSize: 12, marginTop: 2 }}>DAYS</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
