import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posterUrl } from '../../utils/tmdbImageUrl';

const STATUS_BAR = {
  watching: '#F5C518',
  watchlist: '#2196F3',
  completed: '#4CAF50',
  paused: '#FF9800',
  dropped: '#E53935',
  rewatching: '#9C27B0',
};

export default function ShowCard({ item, onClick }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const poster = item.showPoster ? posterUrl(item.showPoster) : null;
  const barColor = STATUS_BAR[item.status] || '#F5C518';

  const handleClick = () => {
    if (onClick) return onClick(item);
    navigate(`/show/${item.tmdbShowId}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: 'pointer', position: 'relative', borderRadius: 6, overflow: 'hidden', aspectRatio: '2/3', background: '#1e1e24' }}
    >
      {poster && !imgError ? (
        <img
          src={poster}
          alt={item.showTitle}
          onError={() => setImgError(true)}
          className="poster-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 8, textAlign: 'center', background: 'linear-gradient(135deg, #2a2a35 0%, #141419 100%)' }}>
          <span style={{ fontSize: 28, marginBottom: 4 }}>📺</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#e0e0e0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.showTitle}
          </span>
        </div>
      )}
      {/* Status bar at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: barColor }} />
    </div>
  );
}

