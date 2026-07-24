import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';

const JobCard = ({ match }) => {
  const scorePercent = Math.round((match.final_score || 0) * 100);

  const scoreColor =
    scorePercent >= 80 ? 'text-signal border-signal/30 bg-signal/10' :
    scorePercent >= 60 ? 'text-brass border-brass/30 bg-brass/10' :
    'text-muted border-white/10 bg-white/5';

  return (
    <div className="bg-surface border border-white/5 rounded-2xl p-5 flex flex-col gap-3 hover:border-brass/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-text leading-snug">{match.title}</h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${scoreColor}`}>
          {scorePercent}%
        </span>
      </div>

      <p className="text-sm text-muted">{match.organization_name || 'Unknown organization'}</p>

      <div className="flex flex-wrap gap-3 text-xs text-muted">
        {match.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {match.location}
          </span>
        )}
        {match.employment_type && (
          <span>{match.employment_type.replace('_', ' ')}</span>
        )}
        {match.deadline_at && (
          <span className="flex items-center gap-1 text-brass">
            <Calendar size={12} /> {new Date(match.deadline_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <a
        href={match.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center justify-center gap-1.5 bg-brass text-ink text-sm font-semibold py-2 rounded-lg hover:bg-brassLight transition-colors"
      >
        Apply <ArrowUpRight size={14} />
      </a>
    </div>
  );
};

export default JobCard;
