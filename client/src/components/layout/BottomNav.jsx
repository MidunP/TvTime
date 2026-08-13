import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function TvIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="3" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}

function MovieIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}

function ExploreIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const TABS = [
  { to: '/', label: 'Shows', Icon: TvIcon },
  { to: '/movies', label: 'Movies', Icon: MovieIcon },
  { to: '/explore', label: 'Explore', Icon: ExploreIcon },
  { to: '/profile', label: 'Profile', Icon: ProfileIcon },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/' || location.pathname.startsWith('/show') || location.pathname.startsWith('/library') || location.pathname.startsWith('/upcoming');
    return location.pathname.startsWith(to);
  };

  return (
    <div className="bottom-nav">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* Desktop Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="hidden md:flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD500] to-[#F5C518] flex items-center justify-center text-[#0A0A0F] font-black text-sm shadow-[0_0_15px_rgba(255,213,0,0.35)] group-hover:scale-105 transition-transform">
            TV
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-base tracking-wider leading-none">
              TV TIME
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
              Tracker
            </span>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="flex items-center justify-around w-full md:w-auto md:gap-8">
          {TABS.map(({ to, label, Icon }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                className="flex-1 md:flex-initial flex flex-col md:flex-row items-center justify-center py-2.5 md:py-1.5 px-3 gap-1 md:gap-2 relative group text-decoration-none"
              >
                <span className={`relative transition-colors duration-200 ${active ? 'text-[#FFD500]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  <Icon active={active} />
                  {to === '/explore' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FFD500] shadow-[0_0_8px_#FFD500]" />
                  )}
                </span>
                <span className={`text-[10px] md:text-xs font-bold tracking-wider uppercase transition-colors duration-200 ${active ? 'text-[#FFD500]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {label}
                </span>

                {/* Active Indicator Underline */}
                {active && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#FFD500] rounded-full shadow-[0_0_10px_#FFD500]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Desktop Quick Search CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/explore')}
            className="btn-yellow text-xs px-4 py-2 flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search Shows</span>
          </button>
        </div>
      </div>
    </div>
  );
}

