import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Check } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(email, password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
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
          <p className="text-muted">Create your account</p>
        </div>

        <form className="bg-surface border border-white/5 rounded-2xl p-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-brass">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-signal/10 border border-signal/30 rounded-lg px-4 py-3 text-sm text-signal flex items-center gap-2">
              <Check size={16} /> Account created! Redirecting to login...
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
              placeholder="Min 8 chars, 1 number"
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
            {loading ? 'Creating...' : 'Register'}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brass hover:text-brassLight transition-colors">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
