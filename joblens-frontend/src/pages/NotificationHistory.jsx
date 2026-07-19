import { useEffect, useState } from 'react';
import api from '../api/client.js';
import styles from './NotificationHistory.module.css';

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
    <div className={styles.container}>
      <h1>Notification History</h1>
      {error && <p className={styles.error}>{error}</p>}
      {history.length === 0 ? (
        <p className={styles.empty}>No notifications sent yet.</p>
      ) : (
        <ul className={styles.list}>
          {history.map((n) => (
            <li key={n.id} className={styles.item}>
              <a href={n.source_url} target="_blank" rel="noopener noreferrer">
                {n.title}
              </a>
              <span className={styles.date}>{new Date(n.sent_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationHistory;
