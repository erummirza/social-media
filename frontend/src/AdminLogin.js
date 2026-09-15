import React, { useState } from 'react';
import API from './api';

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return setError('Please enter username and password.');
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      if (onLogin) onLogin();
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '0.5px solid #C5B8F0', width: '100%', maxWidth: '380px', boxShadow: '0 4px 24px rgba(60,45,138,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '48px' }}>🛡️</div>
          <h2 style={{ color: '#3C2D8A', margin: '8px 0 4px', fontSize: '22px' }}>Admin Login</h2>
          <p style={{ color: '#9B8FE0', fontSize: '13px', margin: 0 }}>Social Media Management Panel</p>
        </div>

        {error && (
          <div style={{ background: '#FCEAEA', border: '1px solid #F5B7B1', borderRadius: '8px', padding: '10px 14px', marginBottom: '1rem', color: '#C0392B', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '13px', color: '#5A4BAD', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="admin"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #C5B8F0', borderRadius: '8px', fontSize: '14px', color: '#3C2D8A', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '13px', color: '#5A4BAD', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #C5B8F0', borderRadius: '8px', fontSize: '14px', color: '#3C2D8A', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#3C2D8A', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Logging in...' : 'Login as Admin 🛡️'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '12px', color: '#C5B8F0' }}>
          <a href="/signin" style={{ color: '#9B8FE0', textDecoration: 'none' }}>← Back to User Login</a>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
