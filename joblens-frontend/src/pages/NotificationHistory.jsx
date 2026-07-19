import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { Bell, ExternalLink } from 'lucide-react';

const NotificationHistory = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/notifications/history')
      .then(({ data }) => setHistory(data.data))
      .catch(() => setError('Could not load notification history.'));
  }, []);

  return (
    <div className="min-h-screen bg-ink text-text px-6 md:px-12 py-10 max-w-4xl mx-auto">
      <h1 className="font-display text-3xl font-semibold mb-8">Notification History</h1>
      
      {error && (
        <div className="bg-surface border border-white/10 rounded-xl px-4 py-3 mb-6 text-sm text-brass">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="flex flex-col items-center text-center py-24 text-muted">
          <Bell size={32} className="text-brass mb-4" />
          <p className="font-display text-lg text-text mb-1">No notifications yet</p>
          <p className="text-sm">JobLens will email you when new matches appear.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((n) => (
            <div key={n.id} className="bg-surface border border-white/5 rounded-xl p-5 hover:border-brass/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <a
                    href={n.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display font-semibold text-text hover:text-brass transition-colors inline-flex items-center gap-2"
                  >
                    {n.title}
                    <ExternalLink size={14} className="text-muted" />
                  </a>
                  <p className="text-sm text-muted mt-1">
                    {n.organization_name || 'Unknown organization'}
                  </p>
                </div>
                <span className="text-xs text-muted whitespace-nowrap">
                  {new Date(n.sent_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationHistory;
