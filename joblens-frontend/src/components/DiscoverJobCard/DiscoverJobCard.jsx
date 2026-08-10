import { useState } from 'react';
import styles from './DiscoverJobCard.module.css';

const formatType = (value) => (value ? value.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : null);

const Gauge = ({ percent }) => {
  const circumference = 2 * Math.PI * 15.9155;
  const filled = (percent / 100) * circumference;
  return (
    <div className={styles.gaugeWrap}>
      <svg className={styles.gaugeSvg} viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke="#e2e2e2" strokeWidth="4"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none" stroke="#006c49" strokeWidth="4"
          strokeDasharray={`${filled}, ${circumference}`}
        />
      </svg>
      <span className={styles.gaugeText}>{percent}%</span>
    </div>
  );
};

// "Saved" toggle is local-only for now -- no saved-jobs table exists in the backend
// yet (confirmed: no applications/saved-jobs migration in this repo). TODO: wire to
// a real POST /saved-jobs endpoint once that table exists; isolated here so it's a
// one-line swap later rather than tangled into rendering logic.
const DiscoverJobCard = ({ match, saved, onToggleSave }) => {
  const [expanded, setExpanded] = useState(false);
  const scorePercent = Math.round(Number(match.final_score ?? match.finalScore ?? 0) * 100);
  const employmentTag = formatType(match.employment_type);
  const skillTags = Array.isArray(match.skills) ? match.skills.slice(0, 3) : [];

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.companyRow}>
          <span className={styles.companyIcon}>
            <span className="material-symbols-outlined">business</span>
          </span>
          <div>
            <h4 className={styles.companyName}>{match.organization_name || 'Unlisted organization'}</h4>
            <p className={styles.companyLocation}>{match.location || 'Location not listed'}</p>
          </div>
        </div>
        <div className={styles.matchWrap}>
          <span className={styles.matchLabel}>AI Match</span>
          <Gauge percent={scorePercent} />
        </div>
      </div>

      <div className={styles.right}>
        <div>
          <div className={styles.titleRow}>
            <a href={match.source_url || '#'} target="_blank" rel="noopener noreferrer" className={styles.jobTitle}>
              {match.title}
            </a>
            <button
              type="button"
              className={`${styles.bookmarkBtn} ${saved ? styles.bookmarkActive : ''}`}
              onClick={() => onToggleSave(match.id || match.job_id)}
              aria-label={saved ? 'Remove from saved' : 'Save job'}
            >
              <span className="material-symbols-outlined" style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {saved ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>

          <div className={styles.tags}>
            {match.location && <span className={styles.tag}>{match.location}</span>}
            {employmentTag && <span className={styles.tag}>{employmentTag}</span>}
            {skillTags.map((skill) => <span key={skill} className={styles.tag}>{skill}</span>)}
          </div>

          {match.description && (
            <p className={`${styles.description} ${expanded ? '' : styles.descriptionClamped}`}>
              {match.description}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          {match.description && match.description.length > 140 && (
            <button type="button" className={styles.detailsBtn} onClick={() => setExpanded((v) => !v)}>
              {expanded ? 'Show Less' : 'View Details'}
            </button>
          )}
          <a href={match.source_url || '#'} target="_blank" rel="noopener noreferrer" className={styles.applyBtn}>
            Apply Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default DiscoverJobCard;