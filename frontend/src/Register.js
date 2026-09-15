import React, { useState } from 'react';
import API from './api';  // ← Import the API instance instead of axios

function Register() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (userId.length < 4) errs.userId = 'User ID must be at least 4 characters.';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (password !== confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🟢 Register button clicked');
    console.log('📤 Data being sent:', { userId, password });
    
    const errs = validate();
    setErrors(errs);
    
    if (Object.keys(errs).length > 0) {
      console.log('❌ Validation failed:', errs);
      return;
    }

    setLoading(true);

    try {
      // ✅ Use API instance instead of axios
      const response = await API.post('/register', {
        userId: userId,
        password: password
      });
      
      console.log('✅ Success:', response.data);
      setSuccess(true);
      setUserId('');
      setPassword('');
      setConfirm('');
      setErrors({});
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.log('❌ Error:', err);
      console.log('❌ Response:', err.response);
      const msg = err.response?.data?.error || 'Registration failed. Try again.';
      setErrors({ server: msg });
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
          Create Account
        </h2>

        {success && (
          <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>
            ✅ Registration successful!
          </p>
        )}
        {errors.server && (
          <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
            ❌ {errors.server}
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
            />
            {errors.userId && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.userId}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#5A4BAD', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
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
            />
            {errors.password && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '6px', color: '#5A4BAD', fontWeight: '500' }}>
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                border: '1.5px solid #C5B8F0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errors.confirm && <p style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{errors.confirm}</p>}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;