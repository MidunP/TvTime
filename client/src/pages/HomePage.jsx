import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';

// Status → bottom progress bar color
const STATUS_BAR = {
  watching:   '#F5C518',
  watchlist:  '#2196F3',
  completed:  '#4CAF50',
  paused:     '#FF9800',
  dropped:    '#E53935',
  rewatching: '#9C27B0',
};

function PosterCard({ item }) {
  const navigate = useNavigate();
  const poster = item.showPoster ? posterUrl(item.showPoster) : null;
  const barColor = STATUS_BAR[item.status] || '#444';

  return (
    <div
      onClick={() => navigate(`/show/${item.tmdbShowId}`)}
      className="poster-card"
      style={{ borderRadius: 6 }}
    >
      {poster ? (
        <img src={poster} alt={item.showTitle} className="poster-img" />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📺</div>
      )}
      {/* Status bar at bottom */}
      <div className="card-progress" style={{ background: barColor }} />
    </div>
  );
}

function WatchNextCard({ item }) {
  const navigate = useNavigate();
  const poster = item.showPoster ? posterUrl(item.showPoster) : null;

  return (
    <div
      onClick={() => navigate(`/show/${item.tmdbShowId}`)}
      className="cursor-pointer"
      style={{ flexShrink: 0, width: 180 }}
    >
      <div style={{ borderRadius: 6, overflow: 'hidden', aspectRatio: '2/3', position: 'relative', marginBottom: 6 }}>
        {poster ? (
          <img src={poster} alt={item.showTitle} className="poster-img" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📺</div>
        )}
        {/* Yellow progress bar at bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#F5C518' }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('watchlist');

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  const watching = watchlist.filter((s) => s.status === 'watching');
  const notStarted = watchlist.filter((s) => s.status === 'watchlist');
  const all = [...watching, ...notStarted];

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Top Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          id="tab-watchlist"
          onClick={() => setActiveTab('watchlist')}
          className="top-tab"
          style={{
            color: activeTab === 'watchlist' ? '#fff' : '#555',
            borderBottom: activeTab === 'watchlist' ? '2px solid #fff' : '2px solid transparent',
          }}
        >
          WATCH LIST
        </button>
        <Link
          to="/upcoming"
          className="top-tab"
          style={{ color: '#555', borderBottom: '2px solid transparent', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          UPCOMING
        </Link>
      </div>

      {/* Grid toggle & section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <div />
        {/* Grid toggle icon (top right) */}
        <button id="grid-toggle" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: 16 }}>
          <div className="skeleton" style={{ height: 240, marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />
            ))}
          </div>
        </div>
      ) : watchlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>📺</div>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Your list is empty</h2>
          <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>Search for your favorite shows to get started.</p>
          <Link to="/explore" className="btn-yellow" style={{ textDecoration: 'none' }}>
            EXPLORE SHOWS
          </Link>
        </motion.div>
      ) : (
        <div style={{ paddingBottom: 16 }}>
          {/* WATCH NEXT section */}
          {watching.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 12px' }}>
                <span className="section-pill">WATCH NEXT</span>
              </div>
              <div className="scroll-x" style={{ display: 'flex', gap: 8, paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
                {watching.slice(0, 10).map((item) => (
                  <WatchNextCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* HAVEN'T STARTED section */}
          {notStarted.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 12px' }}>
                <span className="section-pill">HAVEN'T STARTED</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, padding: '0 4px' }}>
                {notStarted.map((item) => (
                  <PosterCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* If only watching (no not-started), show them all in grid too */}
          {notStarted.length === 0 && watching.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 12px' }}>
                <span className="section-pill">WATCHING</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, padding: '0 4px' }}>
                {watching.map((item) => (
                  <PosterCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
