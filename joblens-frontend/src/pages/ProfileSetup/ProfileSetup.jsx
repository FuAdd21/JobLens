import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import styles from './ProfileSetup.module.css';

const STEPS = ['About You', 'Background', 'Skills', 'Preferences'];

const SIDEBAR_COPY = [
  {
    body: "Tell us a bit more about yourself to unlock personalized matches.",
    why: "JobLens uses this information to establish your baseline profile. We ensure your data is kept secure and only used to provide relevant career intelligence.",
  },
  {
    body: 'Your profession and experience level are what JobLens matches job postings against.',
    why: 'This is the core signal our matching engine uses -- the more specific, the sharper your results.',
  },
  {
    body: 'Skills sharpen your matches beyond your job title alone.',
    why: "Postings that mention your listed skills score higher, even if the job title doesn't exactly match your profession.",
  },
  {
    body: 'Almost done -- tell us where and how you want to work.',
    why: 'JobLens filters out postings outside your preferred locations and employment types automatically.',
  },
];

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'];
const WORK_ARRANGEMENTS = ['REMOTE', 'HYBRID', 'ONSITE'];

const Gauge = ({ percent }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className={styles.gaugeWrap}>
      <svg className={styles.gaugeSvg} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e2e2" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke="#4edea3" strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <span className={`material-symbols-outlined ${styles.gaugeIcon}`}>auto_awesome</span>
    </div>
  );
};

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [visitedMax, setVisitedMax] = useState(0);

  // Existing, backend-connected profile state -- unchanged shape/keys from before.
  const [profile, setProfile] = useState({
    profession: '', educationLevel: 'BACHELOR', experienceLevel: 'JUNIOR',
    preferredLocations: '', employmentTypes: [], workArrangement: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // NEW fields from the Stitch "About You" step -- no backend column exists yet
  // (no full-name/preferred-language field, and location here is free text rather
  // than the existing city/country columns). Kept local-only and never sent to the
  // API so we don't silently fabricate a mapping. TODO: wire these up once the
  // backend profile schema has matching fields.
  const [aboutYou, setAboutYou] = useState({ fullName: '', language: 'English', location: '' });

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
      setSkills((p.skills || []).map((skill) => skill.name));
    }).catch(() => setError('Could not load your profile.'));
  }, []);

  const toggleArrayField = (field, value) => setProfile((prev) => ({
    ...prev,
    [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
  }));

  const addSkill = () => {
    const next = skillInput.trim();
    if (next && !skills.some((s) => s.toLowerCase() === next.toLowerCase())) {
      setSkills([...skills, next]);
      setSkillInput('');
    }
  };
  const removeSkill = (skill) => setSkills(skills.filter((s) => s !== skill));

  // Unchanged from the previous single-page version -- same endpoints, same payload shape.
  const persistProfile = async () => {
    await api.put('/profile', {
      profession: profile.profession,
      educationLevel: profile.educationLevel,
      experienceLevel: profile.experienceLevel,
      preferredLocations: profile.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
      employmentTypes: profile.employmentTypes,
      workArrangement: profile.workArrangement,
    });
    await api.put('/profile/skills', { skills: skills.map((name) => ({ name, proficiencyLevel: 'INTERMEDIATE' })) });
  };

  const goNext = () => {
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setVisitedMax((v) => Math.max(v, next));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await persistProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save profile.');
    }
  };

  // Backend already supports partial updates (only provided fields are written),
  // so Save & Exit can legitimately persist whatever's filled in so far.
  const handleSaveExit = async () => {
    try {
      await persistProfile();
    } catch {
      // Non-blocking -- exiting is still allowed even if the save fails.
    }
    navigate('/dashboard');
  };

  const percent = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.logo}>JobLens</span>
        <button type="button" className={styles.saveExit} onClick={handleSaveExit}>Save &amp; Exit</button>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.contentInner}>
            {/* Stepper */}
            <nav aria-label="Progress" className={styles.stepper}>
              {STEPS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                const clickable = i <= visitedMax;
                return (
                  <div key={label} className={styles.step}>
                    {i < STEPS.length - 1 && (
                      <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />
                    )}
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && setStep(i)}
                      className={`${styles.stepCircle} ${clickable ? styles.stepCircleClickable : ''} ${done ? styles.stepCircleDone : ''} ${active ? styles.stepCircleActive : ''}`}
                    >
                      {done ? (
                        <span className={`material-symbols-outlined ${styles.icon}`}>check</span>
                      ) : null}
                    </button>
                    <span className={`${styles.stepLabel} ${active ? styles.stepLabelActive : ''}`}>{label}</span>
                  </div>
                );
              })}
            </nav>

            {error && <p className={styles.errorBox}>{error}</p>}

            {/* Step 1: About You -- matches Stitch screen exactly; local-only fields */}
            {step === 0 && (
              <>
                <div className={styles.formHead}>
                  <h1 className={styles.title}>About You</h1>
                  <p className={styles.subtitle}>Let's start with the basics to build your career profile.</p>
                </div>
                <div className={styles.form}>
                  <div className={styles.field}>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName" className={styles.input} type="text" placeholder="e.g. Jane Doe"
                      value={aboutYou.fullName}
                      onChange={(e) => setAboutYou({ ...aboutYou, fullName: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="language">Preferred Language</label>
                    <select
                      id="language" className={styles.select}
                      value={aboutYou.language}
                      onChange={(e) => setAboutYou({ ...aboutYou, language: e.target.value })}
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="location">Location</label>
                    <div className={styles.inputIconWrap}>
                      <span className={`material-symbols-outlined ${styles.inputIcon}`}>location_on</span>
                      <input
                        id="location" className={styles.input} type="text" placeholder="City, Country"
                        value={aboutYou.location}
                        onChange={(e) => setAboutYou({ ...aboutYou, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className={`${styles.actions} ${styles.actionsEnd}`}>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Continue <span className={`material-symbols-outlined ${styles.icon}`}>arrow_forward</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Background -- existing profession/education/experience fields */}
            {step === 1 && (
              <>
                <div className={styles.formHead}>
                  <h1 className={styles.title}>Background</h1>
                  <p className={styles.subtitle}>What did you study, and where are you in your career?</p>
                </div>
                <div className={styles.form}>
                  <div className={styles.field}>
                    <label htmlFor="profession">Profession / degree studied</label>
                    <input
                      id="profession" className={styles.input} type="text" placeholder="e.g. Applied Biology"
                      value={profile.profession}
                      onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="educationLevel">Education level</label>
                    <select
                      id="educationLevel" className={styles.select}
                      value={profile.educationLevel}
                      onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                    >
                      <option value="DIPLOMA">Diploma</option>
                      <option value="BACHELOR">Bachelor's</option>
                      <option value="MASTER">Master's</option>
                      <option value="PHD">PhD</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="experienceLevel">Experience level</label>
                    <select
                      id="experienceLevel" className={styles.select}
                      value={profile.experienceLevel}
                      onChange={(e) => setProfile({ ...profile, experienceLevel: e.target.value })}
                    >
                      <option value="INTERNSHIP">Internship</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="MID">Mid-level</option>
                      <option value="SENIOR">Senior</option>
                    </select>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryBtn} onClick={goBack}>Back</button>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Continue <span className={`material-symbols-outlined ${styles.icon}`}>arrow_forward</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Skills -- existing add/remove chip logic */}
            {step === 2 && (
              <>
                <div className={styles.formHead}>
                  <h1 className={styles.title}>Skills</h1>
                  <p className={styles.subtitle}>Add the skills that best represent your expertise.</p>
                </div>
                <div className={styles.form}>
                  <div className={styles.field}>
                    <label htmlFor="skillInput">Skills</label>
                    <div className={styles.skillInputRow}>
                      <input
                        id="skillInput" className={styles.input} type="text" placeholder="e.g. Data analysis"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <button type="button" className={styles.addSkillBtn} onClick={addSkill}>
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                  <div className={styles.chipRow}>
                    {skills.map((skill) => (
                      <span key={skill} className={styles.skillChip}>
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryBtn} onClick={goBack}>Back</button>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Continue <span className={`material-symbols-outlined ${styles.icon}`}>arrow_forward</span>
                  </button>
                </div>
              </>
            )}

            {/* Step 4: Preferences -- existing locations/employment/work-arrangement fields.
                Final submit calls the same two endpoints the old single-page form used. */}
            {step === 3 && (
              <form onSubmit={handleFinish}>
                <div className={styles.formHead}>
                  <h1 className={styles.title}>Preferences</h1>
                  <p className={styles.subtitle}>Where and how do you want to work?</p>
                </div>
                <div className={styles.form}>
                  <div className={styles.field}>
                    <label htmlFor="preferredLocations">Preferred locations</label>
                    <input
                      id="preferredLocations" className={styles.input} type="text" placeholder="Addis Ababa, Remote"
                      value={profile.preferredLocations}
                      onChange={(e) => setProfile({ ...profile, preferredLocations: e.target.value })}
                    />
                    <p className={styles.helperNote}>Separate multiple locations with commas.</p>
                  </div>
                  <div className={styles.field}>
                    <label>Employment types</label>
                    <div className={styles.chipRow}>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <button
                          type="button" key={type}
                          className={`${styles.chip} ${profile.employmentTypes.includes(type) ? styles.chipActive : ''}`}
                          onClick={() => toggleArrayField('employmentTypes', type)}
                        >
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Work arrangement</label>
                    <div className={styles.chipRow}>
                      {WORK_ARRANGEMENTS.map((type) => (
                        <button
                          type="button" key={type}
                          className={`${styles.chip} ${profile.workArrangement.includes(type) ? styles.chipActive : ''}`}
                          onClick={() => toggleArrayField('workArrangement', type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryBtn} onClick={goBack}>Back</button>
                  <button type="submit" className={styles.primaryBtn}>
                    {saved ? 'Saved' : 'Finish'}
                    {!saved && <span className={`material-symbols-outlined ${styles.icon}`}>check</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right sidebar -- persists across all steps */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSticky}>
            <div className={styles.statusCard}>
              <div className={styles.statusHead}>
                <h3 className={styles.statusTitle}>Profile Status</h3>
                <span className={styles.statusPct}>{percent}%</span>
              </div>
              <Gauge percent={percent} />
              <p className={styles.statusBody}>{SIDEBAR_COPY[step].body}</p>
            </div>
            <div className={styles.infoCard}>
              <h4 className={styles.infoTitle}>
                <span className={`material-symbols-outlined ${styles.icon}`}>info</span>
                Why we need this
              </h4>
              <p className={styles.infoBody}>{SIDEBAR_COPY[step].why}</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default ProfileSetup;