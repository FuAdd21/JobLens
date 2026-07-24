import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext.jsx';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/dashboard', label: 'Matches' },
    { to: '/profile', label: 'Profile' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 bg-ink sticky top-0 z-10">
      <Link to="/dashboard" className="font-display font-semibold text-lg tracking-tight">
        Job<span className="text-brass">Lens</span>
      </Link>
      <div className="flex items-center gap-6">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`text-sm transition-colors ${
              pathname === l.to ? 'text-brass' : 'text-muted hover:text-text'
            }`}
          >
            {l.label}
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-signal transition-colors border border-white/10 rounded-full px-3 py-1.5"
        >
          <LogOut size={13} /> Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
