import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <nav className="bg-surface border-b border-white/5 px-6 md:px-12 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="font-display font-semibold text-lg tracking-tight">
          Job<span className="text-brass">Lens</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm text-muted hover:text-text transition-colors">
            Matches
          </Link>
          <Link to="/profile" className="text-sm text-muted hover:text-text transition-colors">
            Profile
          </Link>
          <Link to="/notifications" className="text-sm text-muted hover:text-text transition-colors">
            Notifications
          </Link>
          <Link to="/admin" className="text-sm text-muted hover:text-text transition-colors">
            Admin
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted hover:text-brass transition-colors"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
