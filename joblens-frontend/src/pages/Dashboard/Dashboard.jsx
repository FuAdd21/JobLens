import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext/AuthContext.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import JobCard from '../../components/JobCard/JobCard.jsx';
import styles from './Dashboard.module.css';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// No "name" field exists anywhere in the current data model (profile has no display
// name, onboarding's Full Name field is local-only/unpersisted -- see ProfileSetup).
// Deriving a first name from the real logged-in email is honest and non-fabricated;
// worth revisiting once a real name field exists on the backend.
const deriveName = (email) => {
  if (!email) return '';
  const local = email.split('@')[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
};

const Dashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/matches');
      setMatches(data.data || []);
    } catch {
      setError('Matches could not load. Complete your profile, then refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const refreshMatches = async () => {
    setRefreshing(true);
    setError('');
    try {
      const { data } = await api.post('/matches/refresh');
      setMatches((data.data || []).map((m) => ({ ...m, final_score: m.finalScore ?? m.final_score })));
    } catch (err) {
      setError(err.response?.data?.message || 'Refresh failed. Complete your profile first.');
    } finally {
      setRefreshing(false);
    }
  };

  // Existing filtering logic preserved, now driven by the header search box
  // instead of a dedicated filter sidebar (Stitch's dashboard screen has no
  // filter panel -- that capability belongs on the not-yet-built Discover page,
  // per the sidebar's own information architecture).
  const filteredMatches = useMemo(() => {
    if (!keyword.trim()) return matches;
    const q = keyword.toLowerCase();
    return matches.filter((m) => `${m.title} ${m.organization_name || ''}`.toLowerCase().includes(q));
  }, [keyword, matches]);

  // "New" = matches computed in the last 24h, using the real created_at timestamp
  // already returned by the API -- not an invented number.
  const newCount = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return matches.filter((m) => m.created_at && new Date(m.created_at).getTime() >= cutoff).length;
  }, [matches]);

  const name = deriveName(user?.email);
  const initial = (name || 'J').charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.contentWrap}>
        {/* Mobile header (Stitch shows this only below md) */}
        <header className={styles.headerMobile}>
          <span className={styles.headerLogo}>JobLens</span>
          <div className={styles.headerActions}>
            <Link to="/notifications" className={styles.iconBtn} title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </Link>
            <Link to="/profile" className={styles.avatar}>{initial}</Link>
          </div>
        </header>

        {/* Desktop header */}
        <header className={styles.header}>
          <div className={styles.searchBox}>
            <span className={`material-symbols-outlined ${styles.icon}`}>search</span>
            <input
              placeholder="Search jobs, skills, companies..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className={styles.headerActions}>
            <Link to="/notifications" className={styles.iconBtn} title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
              <span className={styles.iconDot} />
            </Link>
            {/* No help center exists yet -- decorative, matching Stitch's own icon slot. */}
            <button type="button" className={styles.iconBtn} title="Help">
              <span className="material-symbols-outlined">help</span>
            </button>
            <Link to="/profile" className={styles.avatar} title="Profile">{initial}</Link>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.canvas}>
            <section className={styles.greetingSection}>
              <h2 className={styles.greeting}>{getGreeting()}{name ? `, ${name}.` : '.'}</h2>
              <p className={styles.greetingSub}>Here is your career trajectory overview for today.</p>
            </section>

            {/* Stat cards -- Recommended is 100% real data. Saved/Applications have no
                backend concept yet (no saved-jobs or application-tracking tables exist),
                so they're shown honestly at 0 rather than the mocked 14/7 from Stitch,
                with a "Soon" flag matching the sidebar's own treatment of those features. */}
            <section className={styles.statGrid}>
              <div className={styles.statCard}>
                <div className={styles.statHead}>
                  <span className={`material-symbols-outlined ${styles.statIconAccent}`}>insights</span>
                  {newCount > 0 && <span className={styles.statBadge}>+{newCount} new</span>}
                </div>
                <h3 className={styles.statLabel}>Recommended</h3>
                <p className={styles.statValue}>{matches.length}</p>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statHead}>
                  <span className={`material-symbols-outlined ${styles.statIcon}`}>bookmark</span>
                  <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>Soon</span>
                </div>
                <h3 className={styles.statLabel}>Saved</h3>
                <p className={styles.statValue}>0</p>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statHead}>
                  <span className={`material-symbols-outlined ${styles.statIcon}`}>send</span>
                  <span className={`${styles.statBadge} ${styles.statBadgeNeutral}`}>Soon</span>
                </div>
                <h3 className={styles.statLabel}>Applications</h3>
                <p className={styles.statValue}>0</p>
              </div>
            </section>

            <section>
              <div className={styles.sectionHead}>
                <h3 className={styles.sectionTitle}>Recommended For You</h3>
                <button type="button" className={styles.refreshBtn} onClick={refreshMatches} disabled={refreshing}>
                  <span className={`material-symbols-outlined ${refreshing ? styles.spin : ''}`} style={{ fontSize: 16 }}>refresh</span>
                  {refreshing ? 'Scanning...' : 'Refresh'}
                </button>
              </div>

              {error && <div className={styles.errorBox}>{error}</div>}

              {loading ? (
                <div className={styles.list}>
                  {Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={`material-symbols-outlined ${styles.icon}`}>travel_explore</span>
                  <p className={styles.emptyTitle}>Nothing in focus yet</p>
                  <p>Complete your profile and refresh to find matches.</p>
                </div>
              ) : (
                <div className={styles.list}>
                  {filteredMatches.map((match) => (
                    <JobCard key={match.id || match.job_id} match={match} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;