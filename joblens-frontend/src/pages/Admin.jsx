import { useState, useEffect } from "react";
import api from "../api/client.js";
import { Search, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";

const Admin = () => {
  const [sources, setSources] = useState([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState(null);
  const [syncingId, setSyncingId] = useState(null);
  const [syncResults, setSyncResults] = useState({});
  const [websiteKey, setWebsiteKey] = useState("ethiojobs");
  const [websiteResult, setWebsiteResult] = useState(null);
  const [error, setError] = useState("");

  const loadSources = async () => {
    setLoadingSources(true);
    try {
      const { data } = await api.get("/jobs/sources");
      setSources(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sources.");
    } finally {
      setLoadingSources(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    setError("");
    setDiscoveryResult(null);
    try {
      const { data } = await api.post("/jobs/discover-channels");
      setDiscoveryResult(data.data);
      await loadSources();
    } catch (err) {
      setError(err.response?.data?.message || "Discovery failed.");
    } finally {
      setDiscovering(false);
    }
  };

  const handleSyncChannel = async (identifier, sourceId) => {
    setSyncingId(sourceId);
    setError("");
    try {
      const { data } = await api.post("/jobs/sync/telegram", {
        channelUsername: identifier,
      });
      setSyncResults((prev) => ({ ...prev, [sourceId]: data.data }));
    } catch (err) {
      setError(err.response?.data?.message || `Sync failed for ${identifier}.`);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncWebsite = async () => {
    setSyncingId("website");
    setError("");
    setWebsiteResult(null);
    try {
      const { data } = await api.post("/jobs/sync/website", {
        adapterKey: websiteKey,
      });
      setWebsiteResult(data.data);
      await loadSources();
    } catch (err) {
      setError(err.response?.data?.message || "Website sync failed.");
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleSource = async (sourceId) => {
    try {
      await api.patch(`/jobs/sources/${sourceId}/toggle`);
      await loadSources();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle source.");
    }
  };

  return (
    <div className="min-h-screen bg-ink text-text px-6 md:px-12 py-10 max-w-7xl mx-auto">
      <h1 className="font-display text-3xl font-semibold mb-8">Admin — Source Management</h1>
      
      {error && (
        <div className="bg-surface border border-white/10 rounded-xl px-4 py-3 mb-6 text-sm text-brass">
          {error}
        </div>
      )}

      <div className="space-y-8">
        <section className="bg-surface border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Telegram Channel Discovery</h2>
            <button
              onClick={handleDiscover}
              disabled={discovering}
              className="flex items-center gap-2 bg-brass text-ink font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brassLight transition-colors disabled:opacity-50"
            >
              <Search size={14} className={discovering ? 'animate-spin' : ''} />
              {discovering ? "Searching Telegram..." : "Discover Channels"}
            </button>
          </div>
          <p className="text-muted text-sm mb-4">
            Searches Telegram for public job-related channels and registers ones with 500+ members.
          </p>
          {discoveryResult && (
            <div className="bg-surface2 border border-white/5 rounded-lg px-4 py-3 text-sm">
              <span className="text-muted">Searched {discoveryResult.searched} terms · found </span>
              <span className="text-text">{discoveryResult.found} channels</span>
              <span className="text-muted"> · </span>
              <span className="text-brass">{discoveryResult.qualified} qualified</span>
              <span className="text-muted"> · </span>
              <span className="text-signal">{discoveryResult.registered} registered</span>
            </div>
          )}
        </section>

        <section className="bg-surface border border-white/5 rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Website Sync</h2>
          <div className="flex items-center gap-4">
            <select
              value={websiteKey}
              onChange={(e) => setWebsiteKey(e.target.value)}
              className="bg-surface2 border border-white/10 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-brass/50 transition-colors"
            >
              <option value="ethiojobs">ethiojobs.net</option>
            </select>
            <button
              onClick={handleSyncWebsite}
              disabled={syncingId === "website"}
              className="flex items-center gap-2 bg-brass text-ink font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-brassLight transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={syncingId === "website" ? 'animate-spin' : ''} />
              {syncingId === "website" ? "Scraping..." : "Sync Now"}
            </button>
          </div>
          {websiteResult && (
            <div className="mt-4 bg-surface2 border border-white/5 rounded-lg px-4 py-3 text-sm">
              <span className="text-signal">Created {websiteResult.created}</span>
              <span className="text-muted"> · Duplicates {websiteResult.duplicates} · Skipped {websiteResult.skipped} · Total scanned {websiteResult.total}</span>
            </div>
          )}
        </section>

        <section className="bg-surface border border-white/5 rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Registered Sources ({sources.length})</h2>
          {loadingSources ? (
            <p className="text-muted text-sm">Loading...</p>
          ) : sources.length === 0 ? (
            <p className="text-muted text-sm">No sources yet — run discovery above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-muted font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Reliability</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Last Sync</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-text">{s.name}</td>
                      <td className="py-3 px-4 text-muted">{s.type}</td>
                      <td className="py-3 px-4 text-text">{s.reliability_score}</td>
                      <td className="py-3 px-4 text-muted">
                        {s.last_successful_sync
                          ? new Date(s.last_successful_sync).toLocaleString()
                          : "Never"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                          s.active ? 'bg-signal/10 text-signal border border-signal/30' : 'bg-white/5 text-muted border border-white/10'
                        }`}>
                          {s.active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                          {s.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSource(s.id)}
                            className="text-xs bg-surface2 border border-white/10 text-muted px-3 py-1.5 rounded-lg hover:border-brass/30 hover:text-text transition-colors"
                          >
                            {s.active ? "Deactivate" : "Activate"}
                          </button>
                          {s.type === "TELEGRAM" && (
                            <button
                              onClick={() => handleSyncChannel(s.identifier, s.id)}
                              disabled={syncingId === s.id}
                              className="text-xs bg-surface2 border border-white/10 text-muted px-3 py-1.5 rounded-lg hover:border-brass/30 hover:text-text transition-colors disabled:opacity-50 flex items-center gap-1"
                            >
                              <RefreshCw size={10} className={syncingId === s.id ? 'animate-spin' : ''} />
                              {syncingId === s.id ? "Syncing..." : "Sync"}
                            </button>
                          )}
                          {syncResults[s.id] && (
                            <span className="text-xs text-signal font-medium">+{syncResults[s.id].created}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Admin;
