import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, MapPin, RefreshCw, SlidersHorizontal, Telescope } from 'lucide-react';
import api from '../../api/client.js';
import JobCard from '../../components/JobCard/JobCard.jsx';

const CheckRow = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-text">
    <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-line text-blue accent-blue" />
    {label}
  </label>
);

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', location: '', minScore: 50, types: [], arrangements: [] });
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchesResponse, profileResponse] = await Promise.all([api.get('/matches'), api.get('/profile')]);
      setMatches(matchesResponse.data.data || []);
      setProfile(profileResponse.data.data || null);
    } catch {
      setError('Matches could not load. Complete your profile, then refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleFilter = (group, value) => {
    setFilters((prev) => ({
      ...prev,
      [group]: prev[group].includes(value) ? prev[group].filter((item) => item !== value) : [...prev[group], value],
    }));
  };

  const refreshMatches = async () => {
    setRefreshing(true);
    setError('');
    try {
      const { data } = await api.post('/matches/refresh');
      setMatches((data.data || []).map((match) => ({ ...match, final_score: match.finalScore || match.final_score })));
    } catch (err) {
      setError(err.response?.data?.message || 'Refresh failed. Complete your profile first.');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const score = Number(match.final_score || match.finalScore || 0) * 100;
      const keywordMatch = !filters.keyword || `${match.title} ${match.organization_name || ''}`.toLowerCase().includes(filters.keyword.toLowerCase());
      const locationMatch = !filters.location || (match.location || '').toLowerCase().includes(filters.location.toLowerCase());
      const typeMatch = filters.types.length === 0 || filters.types.includes(match.employment_type);
      const arrangementMatch = filters.arrangements.length === 0 || filters.arrangements.some((item) => `${match.work_arrangement || ''}`.toUpperCase().includes(item));
      return score >= filters.minScore && keywordMatch && locationMatch && typeMatch && arrangementMatch;
    });
  }, [filters, matches]);

  const skills = profile?.skills || [];

  return (
    <main className="min-h-screen bg-page px-4 py-5 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[250px_minmax(0,1fr)_290px]">
        <aside className="rounded-lg bg-surface p-5 shadow-sm ring-1 ring-line">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold text-navy">Filters</h2>
            <button onClick={() => setFilters({ keyword: '', location: '', minScore: 50, types: [], arrangements: [] })} className="text-xs font-semibold text-blue">
              Clear all
            </button>
          </div>
          <div className="space-y-5">
            <section>
              <p className="mb-3 text-sm font-bold text-navy">Employment Type</p>
              <div className="space-y-2">
                {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].map((type) => (
                  <CheckRow key={type} label={type.replace('_', ' ')} checked={filters.types.includes(type)} onChange={() => toggleFilter('types', type)} />
                ))}
              </div>
            </section>
            <section className="border-t border-line pt-5">
              <p className="mb-3 text-sm font-bold text-navy">Work Arrangement</p>
              <div className="space-y-2">
                {['ONSITE', 'HYBRID', 'REMOTE'].map((type) => (
                  <CheckRow key={type} label={type[0] + type.slice(1).toLowerCase()} checked={filters.arrangements.includes(type)} onChange={() => toggleFilter('arrangements', type)} />
                ))}
              </div>
            </section>
            <section className="border-t border-line pt-5">
              <p className="mb-3 text-sm font-bold text-navy">Minimum Match Score</p>
              <input type="range" min="0" max="100" value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: Number(e.target.value) })} className="w-full accent-blue" />
              <div className="mt-1 flex justify-between text-xs font-semibold text-muted">
                <span>0%</span>
                <span>{filters.minScore}%</span>
                <span>100%</span>
              </div>
            </section>
          </div>
        </aside>

        <section>
          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3 shadow-sm ring-1 ring-line">
              <BriefcaseBusiness size={18} className="text-muted" />
              <input value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} placeholder="Search job title or organization" className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
            </label>
            <label className="flex items-center gap-3 rounded-lg bg-surface px-4 py-3 shadow-sm ring-1 ring-line">
              <MapPin size={18} className="text-muted" />
              <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Location" className="w-full bg-transparent text-sm outline-none placeholder:text-muted" />
            </label>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">{filteredMatches.length} matched jobs</p>
            <button onClick={refreshMatches} disabled={refreshing} className="inline-flex items-center gap-2 rounded-md bg-blue px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Scanning' : 'Refresh'}
            </button>
          </div>

          {error && <div className="mb-5 rounded-lg border border-magenta/20 bg-magenta/10 px-4 py-3 text-sm text-magenta">{error}</div>}

          {loading ? (
            <div className="grid gap-5 xl:grid-cols-2">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-white ring-1 ring-line" />)}</div>
          ) : filteredMatches.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-lg bg-surface text-center ring-1 ring-line">
              <Telescope size={34} className="mb-3 text-blue" />
              <p className="font-bold text-navy">Nothing in focus yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted">Adjust filters or refresh after completing your JobLens profile.</p>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">{filteredMatches.map((match) => <JobCard key={match.id || match.job_id} match={match} />)}</div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg bg-surface p-5 text-center shadow-sm ring-1 ring-line">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blueSoft text-2xl font-extrabold text-blue">
              {(profile?.profession || 'J').slice(0, 1).toUpperCase()}
            </span>
            <h2 className="mt-3 font-extrabold text-navy">{profile?.profession || 'JobLens profile'}</h2>
            <p className="text-sm text-muted">{profile?.experience_level || 'Experience'} applicant</p>
            <span className="mt-4 inline-flex rounded-md bg-surface2 px-5 py-2 text-xs font-bold text-navy">Notifications on</span>
          </div>
          <div className="rounded-lg bg-surface p-5 shadow-sm ring-1 ring-line">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-navy">Profile Summary</h2>
              <SlidersHorizontal size={17} className="text-muted" />
            </div>
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold text-navy">Education</span><br /><span className="text-muted">{profile?.education_level || 'Not set'}</span></p>
              <p><span className="font-semibold text-navy">Experience</span><br /><span className="text-muted">{profile?.experience_level || 'Not set'}</span></p>
              <p><span className="font-semibold text-navy">Locations</span><br /><span className="text-muted">{(profile?.preferred_locations || []).join(', ') || 'Any'}</span></p>
            </div>
          </div>
          <div className="rounded-lg bg-surface p-5 shadow-sm ring-1 ring-line">
            <h2 className="mb-4 font-bold text-navy">Work Skill</h2>
            <div className="flex flex-wrap gap-2">
              {skills.length ? skills.map((skill) => <span key={skill.id || skill.name} className="rounded-md bg-surface2 px-3 py-1.5 text-xs font-semibold text-muted">{skill.name}</span>) : <span className="text-sm text-muted">Add skills in your profile.</span>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Dashboard;
