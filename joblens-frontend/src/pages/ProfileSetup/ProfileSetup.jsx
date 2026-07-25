import { Check, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../api/client.js';

const inputClass = 'w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-blue';

const Chip = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={`rounded-md px-3 py-2 text-xs font-bold transition ${active ? 'bg-blue text-white' : 'bg-surface2 text-muted hover:text-blue'}`}>
    {children}
  </button>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-bold text-navy">{label}</span>
    {children}
  </label>
);

const ProfileSetup = () => {
  const [profile, setProfile] = useState({ profession: '', educationLevel: 'BACHELOR', experienceLevel: 'JUNIOR', preferredLocations: '', employmentTypes: [], workArrangement: [] });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/profile').then(({ data }) => {
      const nextProfile = data.data;
      setProfile({
        profession: nextProfile.profession || '',
        educationLevel: nextProfile.education_level || 'BACHELOR',
        experienceLevel: nextProfile.experience_level || 'JUNIOR',
        preferredLocations: (nextProfile.preferred_locations || []).join(', '),
        employmentTypes: nextProfile.employment_types || [],
        workArrangement: nextProfile.work_arrangement || [],
      });
      setSkills((nextProfile.skills || []).map((skill) => skill.name));
    }).catch(() => setError('Could not load your profile.'));
  }, []);

  const toggleArrayField = (field, value) => setProfile((prev) => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value] }));
  const addSkill = () => {
    const nextSkill = skillInput.trim();
    if (nextSkill && !skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase())) {
      setSkills([...skills, nextSkill]);
      setSkillInput('');
    }
  };
  const removeSkill = (skill) => setSkills(skills.filter((item) => item !== skill));

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.put('/profile', {
        profession: profile.profession,
        educationLevel: profile.educationLevel,
        experienceLevel: profile.experienceLevel,
        preferredLocations: profile.preferredLocations.split(',').map((item) => item.trim()).filter(Boolean),
        employmentTypes: profile.employmentTypes,
        workArrangement: profile.workArrangement,
      });
      await api.put('/profile/skills', { skills: skills.map((name) => ({ name, proficiencyLevel: 'INTERMEDIATE' })) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile.');
    }
  };

  return (
    <main className="min-h-screen bg-page px-4 py-8">
      <form onSubmit={handleSave} className="mx-auto max-w-3xl rounded-lg bg-surface p-8 shadow-sm ring-1 ring-line">
        <h1 className="text-2xl font-extrabold text-navy">Your profile</h1>
        <p className="mt-1 text-sm text-muted">JobLens uses this to rank fresh openings against your profession and skills.</p>
        {error && <p className="mt-5 rounded-lg border border-magenta/20 bg-magenta/10 px-4 py-3 text-sm text-magenta">{error}</p>}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2"><Field label="Profession / degree studied"><input className={inputClass} value={profile.profession} onChange={(event) => setProfile({ ...profile, profession: event.target.value })} placeholder="e.g. Applied Biology" /></Field></div>
          <Field label="Education level"><select className={inputClass} value={profile.educationLevel} onChange={(event) => setProfile({ ...profile, educationLevel: event.target.value })}><option value="DIPLOMA">Diploma</option><option value="BACHELOR">Bachelor's</option><option value="MASTER">Master's</option><option value="PHD">PhD</option></select></Field>
          <Field label="Experience level"><select className={inputClass} value={profile.experienceLevel} onChange={(event) => setProfile({ ...profile, experienceLevel: event.target.value })}><option value="INTERNSHIP">Internship</option><option value="JUNIOR">Junior</option><option value="MID">Mid-level</option><option value="SENIOR">Senior</option></select></Field>
          <div className="md:col-span-2"><Field label="Preferred locations"><input className={inputClass} value={profile.preferredLocations} onChange={(event) => setProfile({ ...profile, preferredLocations: event.target.value })} placeholder="Addis Ababa, Remote" /></Field></div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section><p className="mb-3 text-sm font-bold text-navy">Employment types</p><div className="flex flex-wrap gap-2">{['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].map((type) => <Chip key={type} active={profile.employmentTypes.includes(type)} onClick={() => toggleArrayField('employmentTypes', type)}>{type.replace('_', ' ')}</Chip>)}</div></section>
          <section><p className="mb-3 text-sm font-bold text-navy">Work arrangement</p><div className="flex flex-wrap gap-2">{['REMOTE', 'HYBRID', 'ONSITE'].map((type) => <Chip key={type} active={profile.workArrangement.includes(type)} onClick={() => toggleArrayField('workArrangement', type)}>{type}</Chip>)}</div></section>
        </div>
        <section className="mt-6">
          <p className="mb-3 text-sm font-bold text-navy">Skills</p>
          <div className="flex gap-2"><input className={inputClass} value={skillInput} onChange={(event) => setSkillInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addSkill())} placeholder="e.g. Data analysis" /><button type="button" onClick={addSkill} className="rounded-lg bg-blue px-4 text-white"><Plus size={18} /></button></div>
          <div className="mt-3 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="inline-flex items-center gap-2 rounded-md bg-surface2 px-3 py-2 text-xs font-semibold text-muted">{skill}<button type="button" onClick={() => removeSkill(skill)} className="text-muted hover:text-magenta"><X size={13} /></button></span>)}</div>
        </section>
        <button type="submit" className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-blue px-5 py-3 text-sm font-extrabold text-white">
          {saved ? <><Check size={16} /> Saved</> : 'Save profile'}
        </button>
      </form>
    </main>
  );
};

export default ProfileSetup;
