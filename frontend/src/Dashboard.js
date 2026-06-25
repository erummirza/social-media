import React, { useState, useEffect } from 'react';
import API from './api';

function Dashboard({ loggedInUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState({});
  const [showPostBox, setShowPostBox] = useState(false);
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [postLoading, setPostLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userStats, setUserStats] = useState({
    followers: 0,
    following: 0,
    totalPosts: 0,
    totalLikes: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const getCurrentUser = () => {
    return loggedInUser || localStorage.getItem('loggedInUser');
  };

  useEffect(() => {
    checkAuthentication();
    const interval = setInterval(checkAuthentication, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchPosts();
      fetchUserStats();
    }
  }, [loggedInUser, isAuthenticated]);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const currentUser = getCurrentUser();
    
    console.log('🔍 Checking authentication:', { 
      token: token ? 'exists' : 'missing', 
      currentUser,
    });
    
    if (!token || !currentUser) {
      setIsAuthenticated(false);
      setUsers([]);
      setPosts([]);
      setFollowing({});
      setError('Session expired. Please sign in again.');
    } else {
      setIsAuthenticated(true);
      setError('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUsers([]);
    setPosts([]);
    setFollowing({});
    setError('You have been logged out.');
    if (onLogout) onLogout();
    window.location.href = '/signin';
  };

  const fetchUserStats = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    setStatsLoading(true);
    try {
      const profileResponse = await API.get(`/profile/${currentUser}`);
      const userProfile = profileResponse.data;

      const postsResponse = await API.get('/posts');
      const allPosts = postsResponse.data;

      const userPosts = allPosts.filter(post => post.userId === currentUser);
      const totalLikesReceived = userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);

      setUserStats({
        followers: userProfile.followers?.length || 0,
        following: userProfile.following?.length || 0,
        totalPosts: userPosts.length,
        totalLikes: totalLikesReceived
      });
    } catch (err) {
      console.log('❌ Error fetching stats:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Please sign in to view users.');
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }
    try {
      const response = await API.get(`/users/${currentUser}`);
      setUsers(response.data);
      
      const me = await API.get(`/profile/${currentUser}`);
      const followingMap = {};
      me.data.following.forEach(uid => {
        followingMap[uid] = true;
      });
      setFollowing(followingMap);
    } catch (err) {
      console.log('❌ Error fetching users:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setError('Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    try {
      const response = await API.get('/posts');
      setPosts(response.data);
    } catch (err) {
      console.log('❌ Error fetching posts:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const handleFollow = async (targetUserId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      handleLogout();
      return;
    }
    
    const isFollowing = following[targetUserId];
    setFollowing(prev => ({ ...prev, [targetUserId]: !prev[targetUserId] }));
    try {
      if (isFollowing) {
        await API.post('/unfollow', { targetUser: targetUserId });
      } else {
        await API.post('/follow', { targetUser: targetUserId });
      }
      fetchUserStats();
    } catch (err) {
      setFollowing(prev => ({ ...prev, [targetUserId]: isFollowing }));
      console.log('❌ Follow/unfollow error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        alert('Failed to update follow status');
      }
    }
  };

  const handlePost = async () => {
    if (!postText.trim()) return;
    const currentUser = getCurrentUser();
    if (!currentUser) {
      handleLogout();
      return;
    }
    
    setPostLoading(true);
    try {
      const response = await API.post('/posts', {
        text: postText,
      });
      setPosts(prev => [response.data.post, ...prev]);
      setPostText('');
      setShowPostBox(false);
      fetchUserStats();
    } catch (err) {
      console.log('❌ Post error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        alert('Failed to create post');
      }
    } finally {
      setPostLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
      fetchUserStats();
    } catch (err) {
      console.log('❌ Delete error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        alert('Failed to delete post');
      }
    }
  };

  const handleLike = async (postId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      handleLogout();
      return;
    }
    
    if (likeLoading[postId]) return;
    setLikeLoading(prev => ({ ...prev, [postId]: true }));
    
    const currentPost = posts.find(p => p._id === postId);
    const wasLiked = currentPost?.likes?.includes(currentUser);
    
    setPosts(prev =>
      prev.map(post => {
        if (post._id === postId) {
          const newLikes = wasLiked
            ? post.likes.filter(id => id !== currentUser)
            : [...post.likes, currentUser];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );
    
    try {
      const response = await API.post(`/posts/${postId}/like`, {});
      const updatedPost = response.data.post;
      setPosts(prev =>
        prev.map(p => p._id === postId ? updatedPost : p)
      );
      fetchUserStats();
    } catch (err) {
      console.log('❌ Like error:', err);
      setPosts(prev =>
        prev.map(post => {
          if (post._id === postId) {
            return { ...post, likes: wasLiked ? [...post.likes, currentUser] : post.likes.filter(id => id !== currentUser) };
          }
          return post;
        })
      );
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        alert('Failed to update like. Please try again.');
      }
    } finally {
      setLikeLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const currentUser = getCurrentUser();

  if (!isAuthenticated || !currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#F3F0FF'
      }}>
        <div style={{ 
          textAlign: 'center', 
          background: '#fff', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '0.5px solid #C5B8F0',
          maxWidth: '400px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#3C2D8A', marginBottom: '1rem' }}>Session Expired</h2>
          <p style={{ color: '#9B8FE0', marginBottom: '1.5rem' }}>{error || 'Please sign in to continue.'}</p>
          <button 
            onClick={() => window.location.href = '/signin'} 
            style={{
              padding: '10px 24px',
              background: '#7B6FD0',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const StatsCards = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      padding: '1.5rem',
      background: '#fff',
      borderBottom: '0.5px solid #E0D9FF'
    }}>
      <div style={{
        background: '#F3F0FF',
        padding: '1rem',
        borderRadius: '10px',
        textAlign: 'center',
        border: '0.5px solid #C5B8F0',
      }}>
        <div style={{ fontSize: '28px', color: '#7B6FD0' }}>👥</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#3C2D8A' }}>
          {statsLoading ? '...' : userStats.followers}
        </div>
        <div style={{ fontSize: '12px', color: '#9B8FE0' }}>Followers</div>
      </div>

      <div style={{
        background: '#F3F0FF',
        padding: '1rem',
        borderRadius: '10px',
        textAlign: 'center',
        border: '0.5px solid #C5B8F0',
      }}>
        <div style={{ fontSize: '28px', color: '#7B6FD0' }}>👤</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#3C2D8A' }}>
          {statsLoading ? '...' : userStats.following}
        </div>
        <div style={{ fontSize: '12px', color: '#9B8FE0' }}>Following</div>
      </div>

      <div style={{
        background: '#F3F0FF',
        padding: '1rem',
        borderRadius: '10px',
        textAlign: 'center',
        border: '0.5px solid #C5B8F0',
      }}>
        <div style={{ fontSize: '28px', color: '#7B6FD0' }}>📝</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#3C2D8A' }}>
          {statsLoading ? '...' : userStats.totalPosts}
        </div>
        <div style={{ fontSize: '12px', color: '#9B8FE0' }}>Posts</div>
      </div>

      <div style={{
        background: '#F3F0FF',
        padding: '1rem',
        borderRadius: '10px',
        textAlign: 'center',
        border: '0.5px solid #C5B8F0',
      }}>
        <div style={{ fontSize: '28px', color: '#7B6FD0' }}>❤️</div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#3C2D8A' }}>
          {statsLoading ? '...' : userStats.totalLikes}
        </div>
        <div style={{ fontSize: '12px', color: '#9B8FE0' }}>Likes Received</div>
      </div>
    </div>
  );

  return (
    <>
      <div style={{
        background: '#3C2D8A',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>👋</span>
          <div>
            <p style={{ margin: 0, color: '#E0D9FF', fontSize: '13px' }}>Welcome back,</p>
            <p style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>{currentUser}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => { fetchUserStats(); fetchUsers(); fetchPosts(); }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            🔄 Refresh
          </button>
          <button 
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Logout 🚪
          </button>
        </div>
      </div>

      <StatsCards />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
        <div style={{ width: '50%', padding: '2rem 1.5rem', borderRight: '0.5px solid #E0D9FF' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ color: '#3C2D8A', margin: 0, fontSize: '18px' }}>👥 Who to Follow</h2>
            <span style={{ background: '#E0D9FF', color: '#5A4BAD', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
              Total: {users.length}
            </span>
          </div>

          {loading && <p style={{ textAlign: 'center', color: '#9B8FE0' }}>⏳ Loading users...</p>}

          {!loading && !error && users.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9B8FE0' }}>No other users registered yet.</p>
          )}

          {!loading && !error && users.length > 0 && (
            <div style={{ border: '0.5px solid #C5B8F0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr 1.2fr 0.8fr', background: '#3C2D8A', padding: '12px 16px', fontWeight: '500', fontSize: '13px', color: '#E0D9FF' }}>
                <span>#</span><span>User ID</span><span>Registered At</span><span>Follow</span>
              </div>
              {users.map((user, index) => (
                <div key={user._id} style={{ display: 'grid', gridTemplateColumns: '0.4fr 1fr 1.2fr 0.8fr', padding: '12px 16px', fontSize: '14px', color: '#3C2D8A', background: index % 2 === 0 ? '#fff' : '#F3F0FF', borderTop: '0.5px solid #E0D9FF', alignItems: 'center' }}>
                  <span style={{ color: '#9B8FE0' }}>{index + 1}</span>
                  <span style={{ fontWeight: '500' }}>👤 {user.userId}</span>
                  <span style={{ color: '#7B6FD0', fontSize: '12px' }}>{new Date(user.createdAt).toLocaleString()}</span>
                  <button
                    onClick={() => handleFollow(user.userId)}
                    style={{ 
                      padding: '5px 14px', 
                      borderRadius: '20px', 
                      fontSize: '13px', 
                      fontWeight: '500', 
                      cursor: 'pointer', 
                      background: following[user.userId] ? '#fff' : '#7B6FD0', 
                      color: following[user.userId] ? '#7B6FD0' : '#fff', 
                      border: '1.5px solid #7B6FD0',
                    }}
                  >
                    {following[user.userId] ? '✓ Following' : '+ Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '50%', padding: '2rem 1.5rem', background: '#F3F0FF' }}>
          <div
            onClick={() => setShowPostBox(!showPostBox)}
            style={{ 
              background: '#7B6FD0', 
              borderRadius: '10px', 
              padding: '12px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              cursor: 'pointer', 
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✏️</span>
              <span style={{ color: '#fff', fontWeight: '500', fontSize: '14px' }}>Create Post</span>
            </div>
            <span style={{ color: '#E0D9FF', fontSize: '18px' }}>{showPostBox ? '▲' : '▼'}</span>
          </div>

          {showPostBox && (
            <div style={{ background: '#fff', border: '0.5px solid #C5B8F0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <textarea
                placeholder="What's on your mind?"
                value={postText}
                onChange={e => setPostText(e.target.value)}
                rows={4}
                style={{ 
                  width: '100%', 
                  border: '1.5px solid #C5B8F0', 
                  borderRadius: '8px', 
                  padding: '10px 12px', 
                  fontSize: '14px', 
                  color: '#3C2D8A', 
                  outline: 'none', 
                  resize: 'none', 
                  boxSizing: 'border-box', 
                  fontFamily: 'inherit' 
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', color: '#9B8FE0' }}>Posting as <strong>{currentUser}</strong></span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => { setShowPostBox(false); setPostText(''); }} 
                    style={{ 
                      padding: '7px 16px', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      fontWeight: '500', 
                      cursor: 'pointer', 
                      background: '#fff', 
                      color: '#7B6FD0', 
                      border: '1.5px solid #C5B8F0' 
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePost} 
                    disabled={postLoading} 
                    style={{ 
                      padding: '7px 16px', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      fontWeight: '500', 
                      cursor: postLoading ? 'not-allowed' : 'pointer', 
                      background: '#7B6FD0', 
                      color: '#fff', 
                      border: 'none', 
                      opacity: postLoading ? 0.7 : 1 
                    }}
                  >
                    {postLoading ? 'Posting...' : 'Post 🚀'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {posts.length === 0 && !showPostBox && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: '#C5B8F0', fontSize: '14px' }}>No posts yet. Be the first to post!</p>
            </div>
          )}

          {posts.map(post => (
            <div key={post._id} style={{ background: '#fff', border: '0.5px solid #C5B8F0', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: '#7B6FD0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#fff', 
                    fontSize: '14px', 
                    fontWeight: '600' 
                  }}>
                    {post.userId[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600', color: '#3C2D8A', fontSize: '14px' }}>{post.userId}</p>
                    <p style={{ margin: 0, color: '#9B8FE0', fontSize: '11px' }}>{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {post.userId === currentUser && (
                  <button 
                    onClick={() => handleDelete(post._id)} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#C5B8F0', 
                      cursor: 'pointer', 
                      fontSize: '16px', 
                      padding: '4px' 
                    }} 
                    title="Delete post"
                  >
                    🗑️
                  </button>
                )}
              </div>

              <p style={{ margin: '0 0 10px', color: '#3C2D8A', fontSize: '14px', lineHeight: '1.6' }}>
                {post.text}
              </p>

              <div style={{ borderTop: '0.5px solid #E0D9FF', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleLike(post._id)}
                  disabled={likeLoading[post._id]}
                  style={{
                    background:   post.likes?.includes(currentUser) ? '#7B6FD0' : '#fff',
                    color:        post.likes?.includes(currentUser) ? '#fff'    : '#7B6FD0',
                    border:       '1.5px solid #7B6FD0',
                    borderRadius: '20px',
                    padding:      '4px 14px',
                    fontSize:     '13px',
                    fontWeight:   '500',
                    cursor:       likeLoading[post._id] ? 'wait' : 'pointer',
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '5px',
                    transition:   'all 0.2s ease',
                    opacity:      likeLoading[post._id] ? 0.6 : 1,
                  }}
                >
                  <span>{likeLoading[post._id] ? '⏳' : (post.likes?.includes(currentUser) ? '❤️' : '🤍')}</span>
                  <span>{likeLoading[post._id] ? '...' : (post.likes?.includes(currentUser) ? 'Liked' : 'Like')}</span>
                </button>
                <span style={{ fontSize: '13px', color: '#9B8FE0' }}>
                  {post.likes?.length || 0} {post.likes?.length === 1 ? 'like' : 'likes'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;