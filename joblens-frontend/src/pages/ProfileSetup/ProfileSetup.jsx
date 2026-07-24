import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { Check, X, Plus } from 'lucide-react';

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
      active
        ? 'bg-brass text-ink border-brass font-semibold'
        : 'bg-transparent text-muted border-white/10 hover:border-white/25'
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, children }) => (
  <div className="mb-5">
    <label className="text-xs text-muted mb-1.5 block">{label}</label>
    {children}
  </div>
);

const inputClass =
  'w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brass/50 transition-colors';

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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
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
    });
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
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  const handleSave = async (e) => {
    e.preventDefault();
    await api.put('/profile', {
      profession: profile.profession,
      educationLevel: profile.educationLevel,
      experienceLevel: profile.experienceLevel,
      preferredLocations: profile.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
      employmentTypes: profile.employmentTypes,
      workArrangement: profile.workArrangement,
    });
    await api.put('/profile/skills', {
      skills: skills.map((name) => ({ name, proficiencyLevel: 'INTERMEDIATE' })),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-ink px-6 md:px-12 py-10 flex justify-center">
      <form onSubmit={handleSave} className="w-full max-w-xl bg-surface border border-white/5 rounded-2xl p-8">
        <h1 className="font-display text-2xl font-semibold mb-1">Your profile</h1>
        <p className="text-muted text-sm mb-8">
          This is what JobLens reads to find your matches — the more specific, the sharper the results.
        </p>

        <Field label="Profession / degree studied">
          <input
            placeholder="e.g. Applied Biology"
            value={profile.profession}
            onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Education level">
            <select
              value={profile.educationLevel}
              onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
              className={inputClass}
            >
              <option value="DIPLOMA">Diploma</option>
              <option value="BACHELOR">Bachelor's</option>
              <option value="MASTER">Master's</option>
              <option value="PHD">PhD</option>
            </select>
          </Field>
          <Field label="Experience level">
            <select
              value={profile.experienceLevel}
              onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
              className={inputClass}
            >
              <option value="INTERNSHIP">Internship</option>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Mid-level</option>
              <option value="SENIOR">Senior</option>
            </select>
          </Field>
        </div>

        <Field label="Preferred locations">
          <input
            placeholder="Addis Ababa, Remote"
            value={profile.preferredLocations}
            onChange={(e) => setProfile({ ...profile, preferredLocations: e.target.value })}
            className={inputClass}
          />
        </Field>

        <Field label="Employment types">
          <div className="flex flex-wrap gap-2">
            {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].map((type) => (
              <Chip key={type} active={profile.employmentTypes.includes(type)} onClick={() => toggleArrayField('employmentTypes', type)}>
                {type.replace('_', ' ')}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Work arrangement">
          <div className="flex flex-wrap gap-2">
            {['REMOTE', 'HYBRID', 'ONSITE'].map((type) => (
              <Chip key={type} active={profile.workArrangement.includes(type)} onClick={() => toggleArrayField('workArrangement', type)}>
                {type}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Skills">
          <div className="flex gap-2 mb-3">
            <input
              placeholder="e.g. Microbiology"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className={inputClass}
            />
            <button
              type="button"
              onClick={addSkill}
              className="shrink-0 bg-surface2 border border-white/10 rounded-lg px-3 hover:border-brass/40 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="flex items-center gap-1.5 bg-surface2 text-xs px-3 py-1.5 rounded-full">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="text-muted hover:text-brass">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </Field>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-brass text-ink font-semibold py-2.5 rounded-lg hover:bg-brassLight transition-colors mt-2"
        >
          {saved ? <><Check size={15} /> Saved</> : 'Save profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
