import React, { useState, useEffect } from 'react';
import API from './api';


function AdminDashboard() {
  const [users, setUsers]         = useState([]);
  const [posts, setPosts]         = useState([]);
  const [stats, setStats]         = useState({ totalUsers: 0, totalPosts: 0, totalLikes: 0 });
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [search, setSearch]       = useState('');
  const [error, setError]         = useState('');

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  const loadStats = async () => {
    try {
      const res = await API.get('/admin/stats', { headers });
      setStats(res.data);
    } catch (err) {
      console.error('Stats error:', err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/admin/users', { headers });
      setUsers(res.data);
    } catch (err) {
      console.error('Users error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        setError('Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/admin/posts', { headers });
      setPosts(res.data);
    } catch (err) {
      console.error('Posts error:', err);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearch('');
    if (tab === 'posts' && posts.length === 0) loadPosts();
  };

  const deleteUser = async (userId) => {
    if (!window.confirm(`Delete user "${userId}" and ALL their posts? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${userId}`, { headers });
      setUsers(prev => prev.filter(u => u.userId !== userId));
      loadStats();
      alert(`✅ User "${userId}" deleted.`);
    } catch (err) {
      console.error('Delete user error:', err);
      alert('❌ Failed to delete user. Check console.');
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/admin/posts/${postId}`, { headers });
      setPosts(prev => prev.filter(p => p._id !== postId));
      loadStats();
    } catch (err) {
      console.error('Delete post error:', err);
      alert('❌ Failed to delete post. Check console.');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const filteredUsers = users.filter(u =>
    u.userId.toLowerCase().includes(search.toLowerCase())
  );
  const filteredPosts = posts.filter(p =>
    p.userId.toLowerCase().includes(search.toLowerCase()) ||
    p.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F3F0FF', fontFamily: 'sans-serif' }}>

      {/* ── Navbar ── */}
      <div style={{ background: '#2A1F6E', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>🛡️ Admin Dashboard</div>
          <div style={{ color: '#C5B8F0', fontSize: '12px' }}>Social Media Management</div>
        </div>
        <button
          onClick={logout}
          style={{ background: '#fff', color: '#2A1F6E', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
        >
          Logout 🚪
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', padding: '20px 24px', background: '#fff', borderBottom: '1px solid #E0D9FF' }}>
        {[
          { icon: '👥', num: stats.totalUsers,  label: 'Total Users'  },
          { icon: '📝', num: stats.totalPosts,  label: 'Total Posts'  },
          { icon: '❤️', num: stats.totalLikes,  label: 'Total Likes'  },
        ].map(s => (
          <div key={s.label} style={{ background: '#F3F0FF', border: '1px solid #C5B8F0', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px' }}>{s.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#3C2D8A' }}>{s.num}</div>
            <div style={{ fontSize: '12px', color: '#9B8FE0' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '24px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => switchTab('users')}
            style={{ padding: '9px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', background: activeTab === 'users' ? '#3C2D8A' : '#fff', color: activeTab === 'users' ? '#fff' : '#7B6FD0', outline: '1px solid #C5B8F0' }}
          >
            👥 Users ({users.length})
          </button>
          <button
            onClick={() => switchTab('posts')}
            style={{ padding: '9px 24px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', background: activeTab === 'posts' ? '#3C2D8A' : '#fff', color: activeTab === 'posts' ? '#fff' : '#7B6FD0', outline: '1px solid #C5B8F0' }}
          >
            📝 Posts ({posts.length})
          </button>
        </div>

        {/* Search + Refresh */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={activeTab === 'users' ? '🔍 Search by username...' : '🔍 Search posts...'}
            style={{ padding: '9px 14px', border: '1px solid #C5B8F0', borderRadius: '8px', fontSize: '14px', width: '280px', outline: 'none' }}
          />
          <button
            onClick={() => { loadStats(); activeTab === 'users' ? loadUsers() : loadPosts(); }}
            style={{ padding: '9px 20px', background: '#7B6FD0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
          >
            🔄 Refresh
          </button>
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {loading && <p style={{ color: '#9B8FE0', textAlign: 'center', padding: '40px' }}>⏳ Loading...</p>}

        {/* ── Users Table ── */}
        {!loading && activeTab === 'users' && (
          filteredUsers.length === 0
            ? <p style={{ textAlign: 'center', color: '#9B8FE0', padding: '40px' }}>No users found.</p>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 0 1px #C5B8F0' }}>
                  <thead>
                    <tr style={{ background: '#3C2D8A' }}>
                      {['#', 'User ID', 'Date Joined', 'Posts', 'Likes', 'Followers', 'Following', 'Action'].map(h => (
                        <th key={h} style={{ padding: '13px 16px', color: '#E0D9FF', fontSize: '13px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, i) => (
                      <tr key={user._id} style={{ background: i % 2 === 0 ? '#fff' : '#F9F7FF', borderTop: '1px solid #E0D9FF' }}>
                        <td style={{ padding: '13px 16px', color: '#9B8FE0', fontSize: '14px' }}>{i + 1}</td>
                        <td style={{ padding: '13px 16px', fontSize: '14px', fontWeight: '600', color: '#3C2D8A' }}>👤 {user.userId}</td>
                        <td style={{ padding: '13px 16px', fontSize: '13px', color: '#7B6FD0', whiteSpace: 'nowrap' }}>
                          {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ background: '#E0D9FF', color: '#5A4BAD', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                            {user.postCount}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '14px', color: '#E74C3C' }}>❤️ {user.totalLikes}</td>
                        <td style={{ padding: '13px 16px', fontSize: '14px', color: '#3C2D8A' }}>{user.followers}</td>
                        <td style={{ padding: '13px 16px', fontSize: '14px', color: '#3C2D8A' }}>{user.following}</td>
                        <td style={{ padding: '13px 16px' }}>
                          <button
                            onClick={() => deleteUser(user.userId)}
                            style={{
                              background: '#E74C3C',
                              color: '#fff',
                              border: 'none',
                              padding: '7px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}

        {/* ── Posts Table ── */}
        {!loading && activeTab === 'posts' && (
          filteredPosts.length === 0
            ? <p style={{ textAlign: 'center', color: '#9B8FE0', padding: '40px' }}>No posts found. Click Refresh.</p>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 0 0 1px #C5B8F0' }}>
                  <thead>
                    <tr style={{ background: '#3C2D8A' }}>
                      {['#', 'Author', 'Post Content', 'Likes', 'Date', 'Action'].map(h => (
                        <th key={h} style={{ padding: '13px 16px', color: '#E0D9FF', fontSize: '13px', fontWeight: '600', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post, i) => (
                      <tr key={post._id} style={{ background: i % 2 === 0 ? '#fff' : '#F9F7FF', borderTop: '1px solid #E0D9FF' }}>
                        <td style={{ padding: '13px 16px', color: '#9B8FE0', fontSize: '14px' }}>{i + 1}</td>
                        <td style={{ padding: '13px 16px', fontSize: '14px', fontWeight: '600', color: '#3C2D8A', whiteSpace: 'nowrap' }}>👤 {post.userId}</td>
                        <td style={{ padding: '13px 16px', fontSize: '13px', color: '#5A4BAD', maxWidth: '300px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.text}</div>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '14px', color: '#E74C3C' }}>❤️ {post.likes?.length || 0}</td>
                        <td style={{ padding: '13px 16px', fontSize: '13px', color: '#7B6FD0', whiteSpace: 'nowrap' }}>
                          {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <button
                            onClick={() => deletePost(post._id)}
                            style={{
                              background: '#E74C3C',
                              color: '#fff',
                              border: 'none',
                              padding: '7px 16px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
