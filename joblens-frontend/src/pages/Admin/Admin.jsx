import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { Radar, Globe, RefreshCw, Power } from 'lucide-react';

const Admin = () => {
  const [sources, setSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [syncResults, setSyncResults] = useState({});
  const [error, setError] = useState('');

  const loadSources = async () => {
    setLoadingSources(true);
    try {
      const { data } = await api.get('/jobs/sources');
      setSources(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Sources could not load.');
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

  const handleToggle = async (sourceId) => {
    try {
      await api.patch(`/jobs/sources/${sourceId}/toggle`);
      await loadSources();
    } catch (err) {
      setError('Could not toggle source.');
    }
  };

  return (
    <div className="min-h-screen bg-ink px-6 md:px-12 py-10 max-w-5xl mx-auto text-text">
      <h1 className="font-display text-2xl font-semibold mb-1">Source management</h1>
      <p className="text-muted text-sm mb-8">Discover channels, sync sources, and retire ones that aren't reliable.</p>

      {error && (
        <div className="bg-brass/10 border border-brass/20 rounded-lg px-4 py-2.5 text-sm text-brass mb-6">
          {error}
        </div>
      )}

      <div className="bg-surface border border-white/5 rounded-2xl p-6 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radar size={18} className="text-brass" />
          <div>
            <h2 className="font-display font-semibold text-sm">Channel discovery</h2>
            <p className="text-xs text-muted">Finds public Telegram channels with 500+ members posting job content.</p>
          </div>
        </div>
        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="flex items-center gap-2 bg-brass text-ink text-sm font-semibold px-4 py-2 rounded-full hover:bg-brassLight transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={13} className={discovering ? 'animate-spin' : ''} />
          {discovering ? 'Searching...' : 'Discover'}
        </button>
      </div>

      {discoveryResult && (
        <p className="text-xs text-signal mb-6 -mt-3">
          Searched {discoveryResult.searched} terms · found {discoveryResult.found} · qualified {discoveryResult.qualified} · registered {discoveryResult.registered}
        </p>
      )}

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Globe size={16} className="text-brass" />
          <h2 className="font-display font-semibold text-sm">Registered sources ({sources.length})</h2>
        </div>

        {loadingSources ? (
          <p className="text-muted text-sm px-6 py-8">Loading...</p>
        ) : sources.length === 0 ? (
          <p className="text-muted text-sm px-6 py-8">No sources yet — run discovery above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted text-left">
                <th className="px-6 py-2 font-normal">Name</th>
                <th className="px-6 py-2 font-normal">Type</th>
                <th className="px-6 py-2 font-normal">Reliability</th>
                <th className="px-6 py-2 font-normal">Last sync</th>
                <th className="px-6 py-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-6 py-3">{s.name}</td>
                  <td className="px-6 py-3 text-muted">{s.type}</td>
                  <td className="px-6 py-3">
                    <span className={s.reliability_score >= 20 ? 'text-signal' : 'text-muted'}>
                      {s.reliability_score}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted text-xs">
                    {s.last_successful_sync ? new Date(s.last_successful_sync).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {s.type === 'TELEGRAM' && (
                        <button
                          onClick={() => handleSyncChannel(s.identifier, s.id)}
                          disabled={syncingId === s.id}
                          className="text-xs bg-surface2 border border-white/10 px-2.5 py-1 rounded-full hover:border-brass/40 transition-colors disabled:opacity-50"
                        >
                          {syncingId === s.id ? 'Syncing...' : 'Sync'}
                        </button>
                      )}
                      {syncResults[s.id] && (
                        <span className="text-xs text-signal">+{syncResults[s.id].created}</span>
                      )}
                      <button
                        onClick={() => handleToggle(s.id)}
                        title={s.active ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-full border transition-colors ${
                          s.active ? 'border-signal/30 text-signal' : 'border-white/10 text-muted'
                        }`}
                      >
                        <Power size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Admin;
