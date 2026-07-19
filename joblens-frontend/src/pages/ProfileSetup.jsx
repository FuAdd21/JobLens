import { useEffect, useState } from 'react';
import api from '../api/client.js';
import styles from './ProfileSetup.module.css';

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
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSave}>
        <h1>Your Profile</h1>
        <p className={styles.hint}>
          This is what JobLens uses to find matches; the more accurate, the better the matches.
        </p>
        {error && <p className={styles.error}>{error}</p>}

        <label>Profession / Degree studied</label>
        <input
          placeholder="e.g. Applied Biology"
          value={profile.profession}
          onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
        />

        <label>Education level</label>
        <select
          value={profile.educationLevel}
          onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
        >
          <option value="DIPLOMA">Diploma</option>
          <option value="BACHELOR">Bachelor's</option>
          <option value="MASTER">Master's</option>
          <option value="PHD">PhD</option>
        </select>

        <label>Experience level</label>
        <select
          value={profile.experienceLevel}
          onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
        >
          <option value="INTERNSHIP">Internship</option>
          <option value="JUNIOR">Junior</option>
          <option value="MID">Mid-level</option>
          <option value="SENIOR">Senior</option>
        </select>

        <label>Preferred locations (comma-separated)</label>
        <input
          placeholder="Addis Ababa, Remote"
          value={profile.preferredLocations}
          onChange={(e) => setProfile({ ...profile, preferredLocations: e.target.value })}
        />

        <label>Employment types</label>
        <div className={styles.chipRow}>
          {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].map((type) => (
            <button
              type="button"
              key={type}
              className={profile.employmentTypes.includes(type) ? styles.chipActive : styles.chip}
              onClick={() => toggleArrayField('employmentTypes', type)}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>

        <label>Work arrangement</label>
        <div className={styles.chipRow}>
          {['REMOTE', 'HYBRID', 'ONSITE'].map((type) => (
            <button
              type="button"
              key={type}
              className={profile.workArrangement.includes(type) ? styles.chipActive : styles.chip}
              onClick={() => toggleArrayField('workArrangement', type)}
            >
              {type}
            </button>
          ))}
        </div>

        <label>Skills</label>
        <div className={styles.skillInputRow}>
          <input
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
          <button type="button" onClick={addSkill}>
            Add
          </button>
        </div>
        <div className={styles.chipRow}>
          {skills.map((skill) => (
            <span key={skill} className={styles.skillChip}>
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                x
              </button>
            </span>
          ))}
        </div>

        <button type="submit" className={styles.saveBtn}>
          {saved ? 'Saved' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
