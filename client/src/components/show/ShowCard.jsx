import { useNavigate } from 'react-router-dom';
import { posterUrl } from '../../utils/tmdbImageUrl';

const STATUS_BAR = {
  watching:   '#F5C518',
  watchlist:  '#2196F3',
  completed:  '#4CAF50',
  paused:     '#FF9800',
  dropped:    '#E53935',
  rewatching: '#9C27B0',
};

export default function ShowCard({ item, onClick }) {
  const navigate = useNavigate();
  const poster = item.showPoster ? posterUrl(item.showPoster) : null;
  const barColor = STATUS_BAR[item.status] || '#F5C518';

  const handleClick = () => {
    if (onClick) return onClick(item);
    navigate(`/show/${item.tmdbShowId}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: 'pointer', position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '2/3', background: '#1a1a1a' }}
    >
      {poster ? (
        <img src={poster} alt={item.showTitle} className="poster-img" />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📺</div>
      )}
      {/* Status bar at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: barColor }} />
    </div>
  );
}
