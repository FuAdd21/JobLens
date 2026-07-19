import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-text flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold mb-2">
            Job<span className="text-brass">Lens</span>
          </h1>
          <p className="text-muted">Log in to your account</p>
        </div>

        <form className="bg-surface border border-white/5 rounded-2xl p-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-brass">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Email</label>
            <input
              type="email"
              className="w-full bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-brass/50 transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Password</label>
            <input
              type="password"
              className="w-full bg-surface2 border border-white/10 rounded-lg px-4 py-3 text-text placeholder:text-muted/50 focus:outline-none focus:border-brass/50 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brass text-ink font-semibold px-6 py-3 rounded-lg hover:bg-brassLight transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-center text-sm text-muted">
            No account?{' '}
            <Link to="/register" className="text-brass hover:text-brassLight transition-colors">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
