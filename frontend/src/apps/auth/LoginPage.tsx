import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/shared/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const { access_token, refresh_token, user } = res.data;
      setAuth(access_token, refresh_token, user);
      navigate(user.role === 'ADMIN' ? '/admin' : '/developer');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: '0 16px' }}>
      <h1>Log In</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}
          />
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </div>
    </div>
  );
}