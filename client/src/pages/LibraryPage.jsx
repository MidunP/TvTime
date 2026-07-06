import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { showService } from '../services/showService';
import { posterUrl } from '../utils/tmdbImageUrl';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Status → section label and bar color
const STATUS_SECTIONS = [
  { key: 'watching',   label: 'WATCHING',        bar: '#F5C518' },
  { key: 'watchlist',  label: "HAVEN'T STARTED", bar: '#2196F3' },
  { key: 'paused',     label: 'WATCH LATER',      bar: '#FF9800' },
  { key: 'uptodate',   label: 'UP TO DATE',       bar: '#4CAF50' },
  { key: 'completed',  label: 'FINISHED',         bar: '#9C27B0' },
  { key: 'dropped',    label: 'STOPPED',          bar: '#E53935' },
];

function PosterCard({ item }) {
  const navigate = useNavigate();
  const poster = item.showPoster ? posterUrl(item.showPoster) : null;

  // Find bar color from status
  const sec = STATUS_SECTIONS.find((s) => s.key === item.status);
  const barColor = sec?.bar || '#444';

  return (
    <div
      onClick={() => navigate(`/show/${item.tmdbShowId}`)}
      style={{ position: 'relative', cursor: 'pointer', borderRadius: 4, overflow: 'hidden', aspectRatio: '2/3' }}
    >
      {poster ? (
        <img src={poster} alt={item.showTitle} className="poster-img" />
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📺</div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: barColor }} />
    </div>
  );
}

export default function LibraryPage() {
  const navigate = useNavigate();

  const { data: watchlist = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => showService.getWatchlist(),
  });

  if (isLoading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 8px', gap: 12 }}>
          <div className="skeleton" style={{ width: 24, height: 24, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 80, height: 20 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, padding: '0 4px' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />
          ))}
        </div>
      </div>
    );
  }

  const sections = STATUS_SECTIONS.map((sec) => ({
    ...sec,
    items: watchlist.filter((s) => s.status === sec.key),
  })).filter((sec) => sec.items.length > 0);

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#fff' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>Shows</h1>
        {/* Eye icon */}
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F5C518', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <p style={{ color: '#888', fontSize: 15 }}>Your library is empty</p>
          <Link to="/explore" className="btn-yellow" style={{ marginTop: 24, textDecoration: 'none' }}>
            DISCOVER SHOWS
          </Link>
        </div>
      ) : (
        <>
          {sections.map((sec) => (
            <div key={sec.key} style={{ marginBottom: 8 }}>
              {/* Section pill */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 10px' }}>
                <span className="section-pill" style={{ borderColor: sec.bar + '60', color: sec.bar }}>
                  {sec.label}
                </span>
              </div>
              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, padding: '0 4px' }}>
                {sec.items.map((item) => (
                  <PosterCard key={item._id} item={item} />
                ))}
              </div>
            </div>
          ))}

          {/* FILTERS button (fixed at bottom) */}
          <button className="btn-filters" id="filters-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            FILTERS
          </button>
        </>
      )}
    </div>
  );
}
