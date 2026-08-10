import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext/AuthContext.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import DiscoverJobCard from '../../components/DiscoverJobCard/DiscoverJobCard.jsx';
import styles from './Discover.module.css';

// Matches Stitch exactly -- Full-time/Contract only (not the backend's full
// FULL_TIME/PART_TIME/INTERNSHIP/CONTRACT set). Not adding extra checkboxes
// beyond what Stitch shows, per the pixel-fidelity/no-invented-controls rule.
const JOB_TYPES = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
];
const LOCATION_MODELS = [
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Hybrid', value: 'HYBRID' },
];
// Backend experience_level values are INTERNSHIP/JUNIOR/MID/SENIOR -- "Director"
// has no equivalent and will simply match nothing if selected (honest, not faked).
const EXPERIENCE_LEVELS = [
  { label: 'All Levels', value: '' },
  { label: 'Entry Level', value: 'JUNIOR' },
  { label: 'Mid Level', value: 'MID' },
  { label: 'Senior Level', value: 'SENIOR' },
  { label: 'Director', value: 'DIRECTOR' },
];

const deriveInitial = (email) => (email ? email.charAt(0).toUpperCase() : 'J');

const Discover = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [jobTypes, setJobTypes] = useState([]);
  const [locationModels, setLocationModels] = useState(['REMOTE']);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [sortBy, setSortBy] = useState('match');
  const [savedIds, setSavedIds] = useState(() => new Set());

  useEffect(() => {
    api.get('/matches')
      .then(({ data }) => setMatches(data.data || []))
      .catch(() => setError('Could not load opportunities. Complete your profile, then try again.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleInSet = (setter) => (value) => setter((prev) =>
    prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);

  const toggleSaved = (jobId) => setSavedIds((prev) => {
    const next = new Set(prev);
    if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
    return next;
  });

  const results = useMemo(() => {
    let list = matches.filter((m) => {
      const q = keyword.trim().toLowerCase();
      const keywordMatch = !q || `${m.title} ${m.organization_name || ''}`.toLowerCase().includes(q);
      const typeMatch = jobTypes.length === 0 || jobTypes.includes(m.employment_type);
      const locationMatch = locationModels.length === 0
        || locationModels.some((lm) => (m.location || '').toUpperCase().includes(lm) || `${m.employment_type || ''}`.toUpperCase().includes(lm));
      const expMatch = !experienceLevel || m.experience_level === experienceLevel;
      return keywordMatch && typeMatch && locationMatch && expMatch;
    });

    if (sortBy === 'match') {
      list = [...list].sort((a, b) => Number(b.final_score ?? b.finalScore ?? 0) - Number(a.final_score ?? a.finalScore ?? 0));
    } else if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    // "Salary (High to Low)" intentionally not implemented -- no salary field exists
    // anywhere in the jobs schema. Selecting it leaves the current order unchanged
    // rather than sorting against fabricated numbers.

    return list;
  }, [matches, keyword, jobTypes, locationModels, experienceLevel, sortBy]);

  return (
    <div className={styles.page}>
      <Sidebar />
      <div className={styles.contentWrap}>
        <header className={styles.header}>
          <div className={styles.searchBox}>
            <span className={`material-symbols-outlined ${styles.icon}`}>search</span>
            <input
              placeholder="Search roles, skills, or companies..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.iconBtn} title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <span className={styles.avatar}>{deriveInitial(user?.email)}</span>
          </div>
        </header>

        <div className={styles.body}>
          <aside className={styles.filters}>
            <div>
              <h2 className={styles.filtersTitle}>Filters</h2>

              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupLabel}>Job Type</h3>
                {JOB_TYPES.map((opt) => (
                  <label key={opt.value} className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={jobTypes.includes(opt.value)}
                      onChange={() => toggleInSet(setJobTypes)(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupLabel}>Location Model</h3>
                {LOCATION_MODELS.map((opt) => (
                  <label key={opt.value} className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={locationModels.includes(opt.value)}
                      onChange={() => toggleInSet(setLocationModels)(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div className={styles.filterGroup}>
                <h3 className={styles.filterGroupLabel}>Experience Level</h3>
                <select
                  className={styles.select}
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  {EXPERIENCE_LEVELS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          <section className={styles.results}>
            <div className={styles.resultsHead}>
              <div>
                <h1 className={styles.resultsTitle}>Discover Opportunities</h1>
                <p className={styles.resultsSub}>
                  Showing {results.length} matched role{results.length === 1 ? '' : 's'} based on your AI profile.
                </p>
              </div>
              <div className={styles.sortRow}>
                <span className={styles.sortLabel}>Sort by</span>
                <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="match">Match Score (High to Low)</option>
                  <option value="newest">Newest First</option>
                  <option value="salary">Salary (High to Low)</option>
                </select>
              </div>
            </div>

            {error && <div className={styles.errorBox}>{error}</div>}

            {loading ? (
              <div className={styles.list}>
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.skeleton} />)}
              </div>
            ) : results.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={`material-symbols-outlined ${styles.icon}`}>travel_explore</span>
                <p>No roles match your current filters.</p>
              </div>
            ) : (
              <div className={styles.list}>
                {results.map((match) => (
                  <DiscoverJobCard
                    key={match.id || match.job_id}
                    match={match}
                    saved={savedIds.has(match.id || match.job_id)}
                    onToggleSave={toggleSaved}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Discover;