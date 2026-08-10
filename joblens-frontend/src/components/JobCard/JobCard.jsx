import styles from './JobCard.module.css';

const formatType = (value) => (value ? value.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : null);

const JobCard = ({ match }) => {
  const scorePercent = Math.round(Number(match.final_score ?? match.finalScore ?? 0) * 100);
  const similarityPercent = Math.round(Number(match.similarity_score ?? match.similarity ?? 0) * 100);
  const skillOverlapPercent = Math.round(Number(match.skill_overlap_score ?? match.skillScore ?? 0) * 100);

  // Real skill tags from the job posting -- never invented.
  const skillTags = Array.isArray(match.skills) ? match.skills.slice(0, 4) : [];
  const employmentTag = formatType(match.employment_type);

  return (
    <a
      href={match.source_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.head}>
        <div>
          <h4 className={styles.title}>{match.title}</h4>
          <p className={styles.meta}>
            {match.organization_name || 'Unlisted organization'}
            {match.location ? ` • ${match.location}` : ''}
          </p>
        </div>
        <div className={styles.scoreWrap}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreText}>{scorePercent}%</span>
          </div>
          <span className={styles.scoreLabel}>Match</span>
        </div>
      </div>

      {/* AI Insight -- built entirely from real returned numbers (semantic similarity +
          skill overlap already computed by the matching engine). No narrative text is
          invented here since that would misrepresent fabricated copy as real AI analysis. */}
      <div className={styles.insightBox}>
        <p className={styles.insightText}>
          <span className={styles.insightLabel}>AI Insight: </span>
          {similarityPercent}% semantic match on your profile, with {skillOverlapPercent}% direct skill overlap.
        </p>
      </div>

      <div className={styles.tags}>
        {employmentTag && <span className={styles.tag}>{employmentTag}</span>}
        {skillTags.map((skill) => (
          <span key={skill} className={styles.tag}>{skill}</span>
        ))}
        {!employmentTag && skillTags.length === 0 && (
          <span className={styles.tag}>Details in posting</span>
        )}
      </div>

      <div className={styles.footRow}>
        <span>
          <span className={`material-symbols-outlined ${styles.icon}`}>calendar_today</span>
          {match.deadline_at ? new Date(match.deadline_at).toLocaleDateString() : 'Open'}
        </span>
        <span className={styles.applyLink}>
          Apply
          <span className={`material-symbols-outlined ${styles.icon}`} style={{ fontSize: 14 }}>arrow_outward</span>
        </span>
      </div>
    </a>
  );
};

export default JobCard;