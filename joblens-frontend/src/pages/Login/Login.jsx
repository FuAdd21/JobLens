import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext.jsx';

const inputClass = 'w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-blue';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-skywash to-page px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-xl ring-1 ring-line">
        <Link to="/" className="mb-8 flex items-center gap-3 text-navy">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue text-white"><BriefcaseBusiness size={20} /></span>
          <span className="text-xl font-extrabold">JobLens</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-navy">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to review your newest matched jobs.</p>
        {error && <p className="mt-5 rounded-lg border border-magenta/20 bg-magenta/10 px-4 py-3 text-sm text-magenta">{error}</p>}
        <label className="mt-6 block text-sm font-bold text-navy">Email</label>
        <input className={`${inputClass} mt-2`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label className="mt-4 block text-sm font-bold text-navy">Password</label>
        <input className={`${inputClass} mt-2`} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button type="submit" disabled={loading} className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-blue px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60">
          {loading ? 'Logging in...' : 'Log in'} {!loading && <ArrowRight size={16} />}
        </button>
        <p className="mt-5 text-center text-sm text-muted">No account? <Link to="/register" className="font-bold text-blue">Sign up</Link></p>
      </form>
    </main>
  );
};

export default Login;
