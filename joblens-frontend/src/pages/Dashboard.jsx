import { useState, useEffect } from 'react';
import api from '../api/client.js';
import JobCard from '../components/JobCard.jsx';
import { RefreshCw, Telescope } from 'lucide-react';

const SkeletonCard = () => (
  <div className="bg-surface border border-white/5 rounded-2xl p-5 animate-pulse">
    <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
    <div className="h-3 bg-white/10 rounded w-1/2 mb-4" />
    <div className="h-3 bg-white/10 rounded w-full mb-2" />
    <div className="h-8 bg-white/10 rounded mt-3" />
  </div>
);

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMatches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/matches');
      setMatches(data.data);
    } catch {
      setError('Matches could not load. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const { data } = await api.post('/matches/refresh');
      setMatches(data.data.map((m) => ({ ...m, final_score: m.finalScore })));
    } catch (err) {
      setError(err.response?.data?.message || 'Refresh failed. Complete your profile first.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return (
    <div className="min-h-screen bg-ink text-text px-6 md:px-12 py-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your matches</h1>
          <p className="text-muted text-sm mt-1">Ranked by fit, filtered to what's still open.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-brass text-ink font-semibold text-sm px-4 py-2.5 rounded-full hover:bg-brassLight transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Scanning...' : 'Refresh matches'}
        </button>
      </div>

      {error && (
        <div className="bg-surface border border-white/10 rounded-xl px-4 py-3 mb-6 text-sm text-brass">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center text-center py-24 text-muted">
          <Telescope size={32} className="text-brass mb-4" />
          <p className="font-display text-lg text-text mb-1">Nothing in focus yet</p>
          <p className="text-sm max-w-sm">
            Complete your profile with your profession and skills, then refresh — JobLens
            will scan for matches right away.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <JobCard key={m.id || m.job_id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
