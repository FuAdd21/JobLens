import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext/AuthContext.jsx';
import { ArrowRight, Check } from 'lucide-react';

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
      setTimeout(() => navigate('/login'), 1400);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface border border-white/5 rounded-2xl p-8">
        <Link to="/" className="font-display font-semibold text-lg tracking-tight block mb-8">
          Job<span className="text-brass">Lens</span>
        </Link>
        <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-muted text-sm mb-6">Two minutes, then JobLens starts scanning for you.</p>

        {error && (
          <p className="text-sm text-brass bg-brass/10 border border-brass/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}
        {success && (
          <p className="flex items-center gap-2 text-sm text-signal bg-signal/10 border border-signal/20 rounded-lg px-3 py-2 mb-4">
            <Check size={14} /> Account created. Redirecting to login...
          </p>
        )}

        <label className="text-xs text-muted mb-1 block">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-brass/50 transition-colors"
        />

        <label className="text-xs text-muted mb-1 block">Password</label>
        <input
          type="password"
          placeholder="Min 8 characters, 1 number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-sm mb-6 focus:outline-none focus:border-brass/50 transition-colors placeholder:text-muted/50"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brass text-ink font-semibold py-2.5 rounded-lg hover:bg-brassLight transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Register'} {!loading && <ArrowRight size={15} />}
        </button>

        <p className="text-sm text-muted text-center mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brass hover:text-brassLight">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
