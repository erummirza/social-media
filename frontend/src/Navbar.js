import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar({ loggedInUser, setLoggedInUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setLoggedInUser(null);   // ← clear logged in user
    navigate('/');           // ← redirect to home
  };

  return (
    <nav style={{
      background: '#3C2D8A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      height: '60px',
    }}>

      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#7B6FD0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>⚡</div>
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>MyApp</span>
      </Link>

      {/* Center Links */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <Link to="/" style={{
          padding: '7px 14px',
          borderRadius: '8px',
          fontSize: '14px',
          textDecoration: 'none',
          color: location.pathname === '/' ? '#fff' : '#C5B8F0',
          background: location.pathname === '/' ? '#7B6FD0' : 'transparent',
        }}>
          🏠 Home
        </Link>
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

        {loggedInUser ? (
          // ── Logged in: show username + logout ──
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#5A4BAD',
              padding: '6px 14px',
              borderRadius: '20px',
            }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              <span style={{ color: '#E0D9FF', fontSize: '14px', fontWeight: '500' }}>
                {loggedInUser}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#E0D9FF',
                background: 'transparent',
                border: '1px solid #5A4BAD',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        ) : (
          // ── Not logged in: show Sign in + Register ──
          <>
            <Link to="/signin" style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: location.pathname === '/signin' ? '#fff' : '#C5B8F0',
              background: location.pathname === '/signin' ? '#5A4BAD' : 'transparent',
              border: '1px solid #5A4BAD',
              textDecoration: 'none',
            }}>
              Sign in
            </Link>
            <Link to="/register" style={{
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#3C2D8A',
              background: '#E0D9FF',
              textDecoration: 'none',
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;