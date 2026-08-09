import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext.jsx';
import styles from './Register.module.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const result = await register(email, password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1400);
    } else {
      setError(result.message);
    }
  };

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.brand}>
        <span className={styles.brandMark}>
          <span className={`material-symbols-outlined ${styles.icon}`}>lens_blur</span>
        </span>
        <span className={styles.brandWordmark}>
          <span className={styles.brandJob}>JOB</span>
          <span className={styles.brandLens}>LENS</span>
        </span>
      </Link>

      <form onSubmit={handleSubmit} className={styles.card}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Set your profile once, then let JobLens scan for you.</p>

        {error && <p className={styles.errorBox}>{error}</p>}
        {success && <p className={styles.successBox}>Account created. Redirecting...</p>}

        <div className={styles.fieldRow}>
          <label className={styles.label} htmlFor="register-email">Email</label>
        </div>
        <div className={styles.inputWrap}>
          <input
            id="register-email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <span className={styles.inputAdorn}>
            <span className={styles.dotsIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>more_horiz</span>
            </span>
          </span>
        </div>

        <div className={styles.fieldRow}>
          <label className={styles.label} htmlFor="register-password">Password</label>
        </div>
        <div className={styles.inputWrap}>
          <input
            id="register-password"
            className={styles.input}
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 characters, 1 number"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <span className={styles.inputAdorn}>
            <span className={styles.dotsIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>more_horiz</span>
            </span>
            <button
              type="button"
              className={styles.eyeToggle}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </span>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>

        <p className={styles.footerText}>
          Already registered? <Link to="/login" className={styles.footerLink}>Log in</Link>
        </p>
      </form>
    </main>
  );
};

export default Register;