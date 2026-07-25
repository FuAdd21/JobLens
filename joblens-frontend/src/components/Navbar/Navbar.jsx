import { Bell, BriefcaseBusiness, ChevronDown, MessageCircle, Search, UserRound, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext.jsx';

const navLinks = [
  { to: '/dashboard', label: 'Find job' },
  { to: '/dashboard', label: 'My job' },
  { to: '/notifications', label: 'Applications' },
  { to: '/profile', label: 'About us' },
  { to: '/admin', label: 'Employer' },
];

const Navbar = () => {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-3 text-navy">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue text-white shadow-sm">
            <BriefcaseBusiness size={20} />
          </span>
          <span className="text-lg font-extrabold">JobLens</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.to || (link.label === 'Find job' && pathname === '/dashboard');
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`relative text-sm font-semibold transition-colors ${
                  active ? 'text-blue' : 'text-muted hover:text-navy'
                }`}
              >
                {link.label}
                {active && <span className="absolute -bottom-5 left-0 h-0.5 w-full rounded-full bg-blue" />}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden h-9 w-9 items-center justify-center rounded-md bg-page text-muted hover:text-blue sm:flex" title="Search">
            <Search size={17} />
          </button>
          <button className="relative h-9 w-9 rounded-md bg-page text-muted hover:text-blue" title="Notifications">
            <Bell className="m-auto mt-2.5" size={17} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-magenta" />
          </button>
          <button className="hidden h-9 w-9 items-center justify-center rounded-md bg-page text-muted hover:text-blue sm:flex" title="Messages">
            <MessageCircle size={17} />
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blueSoft text-blue">
              <UserRound size={17} />
            </span>
            <ChevronDown size={16} className="text-muted" />
          </div>
          <button onClick={logout} className="h-9 w-9 rounded-md bg-page text-muted hover:text-magenta" title="Log out">
            <LogOut className="m-auto mt-2.5" size={17} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
