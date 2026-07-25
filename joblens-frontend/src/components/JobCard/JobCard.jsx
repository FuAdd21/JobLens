import { ArrowUpRight, BriefcaseBusiness, Calendar, Clock3, MapPin, UsersRound } from 'lucide-react';

const formatType = (value) => (value ? value.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : 'Flexible');

const JobCard = ({ match }) => {
  const scorePercent = Math.round(Number(match.final_score || match.finalScore || 0) * 100);
  const tags = [formatType(match.employment_type), match.experience_level || 'Matched', match.work_arrangement || 'Open'];

  return (
    <article className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blueSoft text-blue">
          <BriefcaseBusiness size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-base font-bold text-navy">{match.title}</h3>
            <span className="shrink-0 rounded-md bg-blueSoft px-2 py-1 text-xs font-bold text-blue">{scorePercent}%</span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-muted">
            <MapPin size={13} /> {match.location || 'Location not listed'}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">
        {match.organization_name || 'Verified JobLens source'} is hiring for this role. JobLens matched it against your profile, skills, and recent active postings.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-md bg-surface2 px-3 py-1 text-xs font-semibold text-muted">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Calendar size={13} />
          {match.deadline_at ? new Date(match.deadline_at).toLocaleDateString() : 'Deadline open'}
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <UsersRound size={13} /> Match found
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <Clock3 size={13} /> Recent
        </span>
        <a
          href={match.source_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 rounded-md bg-blue px-3 py-2 text-xs font-bold text-white hover:bg-blue/90"
        >
          Apply <ArrowUpRight size={13} />
        </a>
      </div>
    </article>
  );
};

export default JobCard;
