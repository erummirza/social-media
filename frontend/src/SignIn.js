// src/SignIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';

function SignIn({ setLoggedInUser }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/signin', { userId, password });
      const { token, user } = response.data;
      
      // ✅ Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('loggedInUser', user.userId); // ← Make sure this is set
      
      console.log('✅ Login successful, saved to localStorage:', {
        token: token.substring(0, 20) + '...',
        loggedInUser: user.userId
      });
      
      setLoggedInUser(user.userId);
      navigate('/dashboard');
    } catch (err) {
      console.log('❌ Login error:', err);
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto', padding: '0 1rem' }}>
      <div style={{
        background: '#fff',
        border: '0.5px solid #C5B8F0',
        borderRadius: '12px',
        padding: '2rem',
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#3C2D8A' }}>
          Sign In
        </h2>

        {error && (
          <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
            ❌ {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#5A4BAD', fontWeight: '500' }}>
              User ID
            </label>
            <input
              type="text"
              placeholder="Enter your user ID"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid #C5B8F0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#5A4BAD', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid #C5B8F0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              background: '#7B6FD0',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;