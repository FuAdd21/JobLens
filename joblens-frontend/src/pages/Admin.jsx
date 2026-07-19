import { useState, useEffect } from 'react';
import api from '../api/client.js';
import styles from './Admin.module.css';

const Admin = () => {
  const [sources, setSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [syncResults, setSyncResults] = useState({});
  const [websiteKey, setWebsiteKey] = useState('ethiojobs');
  const [websiteResult, setWebsiteResult] = useState(null);
  const [error, setError] = useState('');

  const loadSources = async () => {
    setLoadingSources(true);
    try {
      const { data } = await api.get('/jobs/sources');
      setSources(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sources.');
    } finally {
      setLoadingSources(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    setError('');
    setDiscoveryResult(null);
    try {
      const { data } = await api.post('/jobs/discover-channels');
      setDiscoveryResult(data.data);
      await loadSources();
    } catch (err) {
      setError(err.response?.data?.message || 'Discovery failed.');
    } finally {
      setDiscovering(false);
    }
  };

  const handleSyncChannel = async (identifier, sourceId) => {
    setSyncingId(sourceId);
    setError('');
    try {
      const { data } = await api.post('/jobs/sync/telegram', { channelUsername: identifier });
      setSyncResults((prev) => ({ ...prev, [sourceId]: data.data }));
    } catch (err) {
      setError(err.response?.data?.message || `Sync failed for ${identifier}.`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncWebsite = async () => {
    setSyncingId('website');
    setError('');
    setWebsiteResult(null);
    try {
      const { data } = await api.post('/jobs/sync/website', { adapterKey: websiteKey });
      setWebsiteResult(data.data);
      await loadSources();
    } catch (err) {
      setError(err.response?.data?.message || 'Website sync failed.');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Admin — Source Management</h1>
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Telegram Channel Discovery</h2>
          <button onClick={handleDiscover} disabled={discovering}>
            {discovering ? 'Searching Telegram...' : 'Discover Channels'}
          </button>
        </div>
        <p className={styles.hint}>
          Searches Telegram for public job-related channels and registers ones with 500+ members.
        </p>
        {discoveryResult && (
          <p className={styles.result}>
            Searched {discoveryResult.searched} terms · found {discoveryResult.found} channels ·
            {' '}{discoveryResult.qualified} qualified · {discoveryResult.registered} registered.
          </p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Website Sync</h2>
        </div>
        <div className={styles.row}>
          <select value={websiteKey} onChange={(e) => setWebsiteKey(e.target.value)}>
            <option value="ethiojobs">ethiojobs.net</option>
          </select>
          <button onClick={handleSyncWebsite} disabled={syncingId === 'website'}>
            {syncingId === 'website' ? 'Scraping...' : 'Sync Now'}
          </button>
        </div>
        {websiteResult && (
          <p className={styles.result}>
            Created {websiteResult.created} · Duplicates {websiteResult.duplicates} · Skipped {websiteResult.skipped} · Total scanned {websiteResult.total}
          </p>
        )}
      </section>

      <section className={styles.section}>
        <h2>Registered Sources ({sources.length})</h2>
        {loadingSources ? (
          <p className={styles.hint}>Loading...</p>
        ) : sources.length === 0 ? (
          <p className={styles.hint}>No sources yet — run discovery above.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Reliability</th>
                <th>Last Sync</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.type}</td>
                  <td>{s.reliability_score}</td>
                  <td>{s.last_successful_sync ? new Date(s.last_successful_sync).toLocaleString() : 'Never'}</td>
                  <td>
                    {s.type === 'TELEGRAM' && (
                      <button
                        className={styles.smallBtn}
                        onClick={() => handleSyncChannel(s.identifier, s.id)}
                        disabled={syncingId === s.id}
                      >
                        {syncingId === s.id ? 'Syncing...' : 'Sync'}
                      </button>
                    )}
                    {syncResults[s.id] && (
                      <span className={styles.inlineResult}>
                        +{syncResults[s.id].created}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Admin;
