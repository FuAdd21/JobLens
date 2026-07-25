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
    } catch {
      setError('Could not toggle source.');
    }
  };

  return (
    <div className="min-h-screen bg-page px-6 md:px-12 py-10 max-w-5xl mx-auto text-text">
      <h1 className="font-display text-2xl font-bold text-navy mb-1">Source management</h1>
      <p className="text-muted text-sm mb-8">Discover channels, sync sources, and retire ones that aren't reliable.</p>

      {error && (
        <div className="bg-magenta/10 border border-magenta/20 rounded-lg px-4 py-2.5 text-sm text-magenta mb-6">
          {error}
        </div>
      )}

      <div className="bg-surface ring-1 ring-line rounded-2xl p-6 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Radar size={18} className="text-blue" />
          <div>
            <h2 className="font-display font-semibold text-sm text-navy">Channel discovery</h2>
            <p className="text-xs text-muted">Finds public Telegram channels with 500+ members posting job content.</p>
          </div>
        </div>
        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="flex items-center gap-2 bg-blue text-white text-sm font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={13} className={discovering ? 'animate-spin' : ''} />
          {discovering ? 'Searching...' : 'Discover'}
        </button>
      </div>

      {discoveryResult && (
        <p className="text-xs text-green font-semibold mb-6 -mt-3">
          Searched {discoveryResult.searched} terms · found {discoveryResult.found} · qualified {discoveryResult.qualified} · registered {discoveryResult.registered}
        </p>
      )}

      <div className="bg-surface ring-1 ring-line rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-line flex items-center gap-2">
          <Globe size={16} className="text-blue" />
          <h2 className="font-display font-semibold text-sm text-navy">Registered sources ({sources.length})</h2>
        </div>

        {loadingSources ? (
          <p className="text-muted text-sm px-6 py-8">Loading...</p>
        ) : sources.length === 0 ? (
          <p className="text-muted text-sm px-6 py-8">No sources yet — run discovery above.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted text-left bg-surface2">
                <th className="px-6 py-2 font-semibold">Name</th>
                <th className="px-6 py-2 font-semibold">Type</th>
                <th className="px-6 py-2 font-semibold">Reliability</th>
                <th className="px-6 py-2 font-semibold">Last sync</th>
                <th className="px-6 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-6 py-3 text-navy font-medium">{s.name}</td>
                  <td className="px-6 py-3 text-muted">{s.type}</td>
                  <td className="px-6 py-3">
                    <span className={s.reliability_score >= 20 ? 'text-green font-semibold' : 'text-muted'}>
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
                          className="text-xs bg-surface2 text-navy border border-line px-2.5 py-1 rounded-full hover:border-blue/40 transition-colors disabled:opacity-50"
                        >
                          {syncingId === s.id ? 'Syncing...' : 'Sync'}
                        </button>
                      )}
                      {syncResults[s.id] && (
                        <span className="text-xs text-green font-semibold">+{syncResults[s.id].created}</span>
                      )}
                      <button
                        onClick={() => handleToggle(s.id)}
                        title={s.active ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-full border transition-colors ${
                          s.active ? 'border-green/40 text-green' : 'border-line text-muted'
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