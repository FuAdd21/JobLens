import styles from './JobCard.module.css';

const getScore = (match) => {
  const score = match.final_score ?? match.finalScore ?? 0;
  return Math.round(Number(score) * 100);
};

const JobCard = ({ match }) => {
  const scorePercent = getScore(match);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{match.title}</h3>
        <span className={styles.score}>{scorePercent}% match</span>
      </div>
      <p className={styles.org}>{match.organization_name || 'Unknown organization'}</p>
      <p className={styles.meta}>
        {match.location || 'Location not specified'}
        {match.employment_type ? ` - ${match.employment_type.replace('_', ' ')}` : ''}
      </p>
      {match.deadline_at && (
        <p className={styles.deadline}>
          Deadline: {new Date(match.deadline_at).toLocaleDateString()}
        </p>
      )}
      <a href={match.source_url} target="_blank" rel="noopener noreferrer" className={styles.applyBtn}>
        Apply
      </a>
    </div>
  );
};

export default JobCard;
