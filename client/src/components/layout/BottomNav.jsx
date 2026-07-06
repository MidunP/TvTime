import { NavLink, useLocation } from 'react-router-dom';

// TV icon (custom SVG to match the reference)
function TvIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <polyline points="17 2 12 7 7 2"/>
    </svg>
  );
}

function MovieIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  );
}

function ExploreIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

const TABS = [
  { to: '/',        label: 'Shows',   Icon: TvIcon },
  { to: '/movies',  label: 'Movies',  Icon: MovieIcon },
  { to: '/explore', label: 'Explore', Icon: ExploreIcon },
  { to: '/profile', label: 'Profile', Icon: ProfileIcon },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/' || location.pathname.startsWith('/show') || location.pathname.startsWith('/library') || location.pathname.startsWith('/upcoming');
    return location.pathname.startsWith(to);
  };

  return (
    <div className="bottom-nav">
      <div className="flex items-center">
        {TABS.map(({ to, label, Icon }) => {
          const active = isActive(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative"
              style={{ textDecoration: 'none' }}
            >
              {/* Explore tab shows a red dot (notification) */}
              <span className="relative" style={{ color: active ? '#fff' : '#555' }}>
                <Icon active={active} />
                {to === '/explore' && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                    style={{ background: '#FF6B6B' }}
                  />
                )}
              </span>
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: active ? '#fff' : '#555' }}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
