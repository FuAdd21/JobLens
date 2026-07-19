import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { X, Check } from 'lucide-react';

const ProfileSetup = () => {
  const [profile, setProfile] = useState({
    profession: '',
    educationLevel: 'BACHELOR',
    experienceLevel: 'JUNIOR',
    preferredLocations: '',
    employmentTypes: [],
    workArrangement: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get('/profile')
      .then(({ data }) => {
        const p = data.data;
        setProfile({
          profession: p.profession || '',
          educationLevel: p.education_level || 'BACHELOR',
          experienceLevel: p.experience_level || 'JUNIOR',
          preferredLocations: (p.preferred_locations || []).join(', '),
          employmentTypes: p.employment_types || [],
          workArrangement: p.work_arrangement || [],
        });
        setSkills((p.skills || []).map((s) => s.name));
      })
      .catch(() => setError('Could not load your profile.'));
  }, []);

  const toggleArrayField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const addSkill = () => {
    const nextSkill = skillInput.trim();
    const alreadyAdded = skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase());
    if (nextSkill && !alreadyAdded) {
      setSkills([...skills, nextSkill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const uniqueSkills = Array.from(
      new Map(
        skills
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [name.toLowerCase(), name])
      ).values()
    );

    try {
      await api.put('/profile', {
        profession: profile.profession,
        educationLevel: profile.educationLevel,
        experienceLevel: profile.experienceLevel,
        preferredLocations: profile.preferredLocations
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        employmentTypes: profile.employmentTypes,
        workArrangement: profile.workArrangement,
      });
      await api.put('/profile/skills', {
        skills: uniqueSkills.map((name) => ({
          name,
          proficiencyLevel: 'INTERMEDIATE',
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile.');
    }
  };

  return (
    <div className="min-h-screen bg-ink text-text px-6 md:px-12 py-10 max-w-3xl mx-auto">
      <form className="space-y-8" onSubmit={handleSave}>
        <div>
          <h1 className="font-display text-3xl font-semibold mb-2">Your Profile</h1>
          <p className="text-muted text-sm">
            This is what JobLens uses to find matches; the more accurate, the better the matches.
          </p>
        </div>

        {error && (
          <div className="bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-brass">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Profession / Degree studied</label>
            <input
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-brass/50 transition-colors"
              placeholder="e.g. Applied Biology"
              value={profile.profession}
              onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Education level</label>
            <select
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brass/50 transition-colors"
              value={profile.educationLevel}
              onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
            >
              <option value="DIPLOMA">Diploma</option>
              <option value="BACHELOR">Bachelor's</option>
              <option value="MASTER">Master's</option>
              <option value="PHD">PhD</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Experience level</label>
            <select
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-brass/50 transition-colors"
              value={profile.experienceLevel}
              onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
            >
              <option value="INTERNSHIP">Internship</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid-level</option>
              <option value="SENIOR">Senior</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Preferred locations (comma-separated)</label>
            <input
              className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-brass/50 transition-colors"
              placeholder="Addis Ababa, Remote"
              value={profile.preferredLocations}
              onChange={(e) => setProfile({ ...profile, preferredLocations: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Employment types</label>
            <div className="flex flex-wrap gap-2">
              {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    profile.employmentTypes.includes(type)
                      ? 'bg-brass text-ink'
                      : 'bg-surface border border-white/10 text-muted hover:border-brass/30'
                  }`}
                  onClick={() => toggleArrayField('employmentTypes', type)}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Work arrangement</label>
            <div className="flex flex-wrap gap-2">
              {['REMOTE', 'HYBRID', 'ONSITE'].map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    profile.workArrangement.includes(type)
                      ? 'bg-brass text-ink'
                      : 'bg-surface border border-white/10 text-muted hover:border-brass/30'
                  }`}
                  onClick={() => toggleArrayField('workArrangement', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Skills</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-surface border border-white/10 rounded-lg px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-brass/50 transition-colors"
                placeholder="e.g. Microbiology"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-surface2 border border-white/10 text-text px-4 py-3 rounded-lg hover:border-brass/30 transition-colors font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-surface2 border border-white/10 text-text px-3 py-1.5 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-muted hover:text-brass transition-colors"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brass text-ink font-semibold px-6 py-3 rounded-lg hover:bg-brassLight transition-colors flex items-center justify-center gap-2"
        >
          {saved ? <><Check size={16} /> Saved</> : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
