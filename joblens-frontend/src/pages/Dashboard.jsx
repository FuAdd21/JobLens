import { useEffect, useState } from 'react';
import api from '../api/client.js';
import JobCard from '../components/JobCard.jsx';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/matches');
      setMatches(data.data);
    } catch {
      setError('Could not load matches.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const { data } = await api.post('/matches/refresh');
      setMatches(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Refresh failed; check your profile is complete.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h1>Your Matches</h1>
        <button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh Matches'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.empty}>Loading...</p>
      ) : matches.length === 0 ? (
        <p className={styles.empty}>No matches yet. Complete your profile and hit Refresh.</p>
      ) : (
        <div className={styles.grid}>
          {matches.map((m) => (
            <JobCard key={m.id || m.job_id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
