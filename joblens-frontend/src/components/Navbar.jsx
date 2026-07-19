import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <nav className={styles.nav}>
      <span className={styles.logo}>JobLens</span>
      <div className={styles.links}>
        <Link to="/dashboard">Matches</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/notifications">Notifications</Link>
        <button onClick={logout}>Log out</button>
      </div>
    </nav>
  );
};

export default Navbar;
