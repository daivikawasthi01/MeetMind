import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-md bg-paper">
      <div className="w-full max-w-sm">
        <div className="text-center mb-xl">
          <Link to="/" className="font-display font-medium text-xl tracking-[-0.02em]">
            Meet<span className="text-accent">Mind</span>
          </Link>
          <p className="text-sm text-muted mt-xs">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card border border-rule bg-paper-2 p-lg flex flex-col gap-md">
          {error && (
            <div className="text-sm text-bad bg-bad-soft border border-rule rounded-pill px-md py-sm" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="field-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="field"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn btn--primary w-full mt-xs">
            {isLoading ? (
              <span className="flex items-center justify-center gap-sm">
                <span className="w-4 h-4 border-2 border-accent-ink/30 border-t-accent-ink rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Signing in…
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <p className="text-center text-sm text-muted">
            Don&rsquo;t have an account?{' '}
            <Link to="/register" className="text-ink hover:text-accent transition-colors duration-[var(--dur-short)] underline underline-offset-4 decoration-rule-2">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
