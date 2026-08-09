import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext.jsx';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
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
        <h1 className={styles.title}>Sign in to JobLens</h1>
        <p className={styles.subtitle}>Pick up where your job search left off.</p>

        {error && <p className={styles.errorBox}>{error}</p>}

        <div className={styles.fieldRow}>
          <label className={styles.label} htmlFor="login-email">Email</label>
        </div>
        <div className={styles.inputWrap}>
          <input
            id="login-email"
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
          <label className={styles.label} htmlFor="login-password">Password</label>
          {/* Decorative for now -- no password-reset flow exists in the backend yet. */}
          <a className={styles.forgotLink} href="#">Forgot password?</a>
        </div>
        <div className={styles.inputWrap}>
          <input
            id="login-password"
            className={styles.input}
            type={showPassword ? 'text' : 'password'}
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className={styles.footerText}>
          New to JobLens? <Link to="/register" className={styles.footerLink}>Create an account</Link>
        </p>
      </form>
    </main>
  );
};

export default Login;