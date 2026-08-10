import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

// Saved/Applications/Settings correspond to separate Stitch screens
// (saved_jobs, application_tracker, settings) not implemented yet -- shown per
// the design, marked "Soon" rather than linking to a page that doesn't exist,
// per the "don't invent backend behavior" rule. Discover is now implemented.
const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard', to: '/dashboard', enabled: true },
  { icon: 'search', label: 'Discover', to: '/discover', enabled: true },
  { icon: 'bookmark', label: 'Saved', to: null, enabled: false },
  { icon: 'description', label: 'Applications', to: null, enabled: false },
];

const BOTTOM_ITEMS = [
  { icon: 'person', label: 'Profile', to: '/profile', enabled: true },
  { icon: 'settings', label: 'Settings', to: null, enabled: false },
];

const NavLink = ({ item, active }) => {
  if (!item.enabled) {
    return (
      <span className={`${styles.navItem} ${styles.navItemDisabled}`}>
        <span className="material-symbols-outlined">{item.icon}</span>
        <span>{item.label}</span>
        <span className={styles.soonTag}>Soon</span>
      </span>
    );
  }
  return (
    <Link to={item.to} className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}>
      <span className="material-symbols-outlined">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <nav className={styles.sidebar}>
      <Link to="/dashboard" className={styles.brand}>
        <span className={styles.brandMark}>J</span>
        <span>
          <h1 className={styles.brandName}>JobLens AI</h1>
          <p className={styles.brandTag}>Career Architect</p>
        </span>
      </Link>

      <div className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.label} item={item} active={pathname === item.to} />
        ))}
        <div className={styles.navSpacer} />
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.label} item={item} active={pathname === item.to} />
        ))}
      </div>

      <button type="button" className={styles.upgradeBtn} disabled>
        Upgrade to Pro
      </button>
    </nav>
  );
};

export default Sidebar;