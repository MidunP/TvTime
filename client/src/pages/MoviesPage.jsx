import { Link } from 'react-router-dom';

export default function MoviesPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
      <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Movies</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 32, maxWidth: 280, lineHeight: 1.6 }}>
        Movie tracking is coming soon! In the meantime, explore your TV shows.
      </p>
      <Link to="/" className="btn-yellow" style={{ textDecoration: 'none' }}>
        GO TO SHOWS
      </Link>
    </div>
  );
}
