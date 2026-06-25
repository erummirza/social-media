const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();  // ← app is defined HERE
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// ── Connect to MongoDB ───────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// ────────────────────────────────────────────────────
//  SCHEMAS
// ────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  followers: [{ type: String }],
  following: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  likes: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});
const Post = mongoose.model('Post', postSchema);

// ────────────────────────────────────────────────────
//  AUTHENTICATION MIDDLEWARE
// ────────────────────────────────────────────────────

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// ────────────────────────────────────────────────────
//  TEST ROUTE
// ────────────────────────────────────────────────────

app.get('/api/hello', (req, res) => {
  console.log('Received request at /api/hello');
  res.json({ message: 'Hello from Backend!' });
});

// ────────────────────────────────────────────────────
//  AUTH ROUTES
// ────────────────────────────────────────────────────

// Register
app.post('/api/register', async (req, res) => {
  const { userId, password } = req.body;
  try {
    const existing = await User.findOne({ userId });
    if (existing) {
      return res.status(400).json({ error: 'User ID already taken.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ userId, password: hashed });
    await user.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.log('Register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Sign In - Returns JWT Token
app.post('/api/signin', async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(400).json({ error: 'User ID not found.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }
    
    const token = jwt.sign(
      { userId: user.userId, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      message: 'Signed in successfully!',
      token,
      user: {
        userId: user.userId,
        id: user._id,
        followers: user.followers,
        following: user.following
      }
    });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ────────────────────────────────────────────────────
//  USER ROUTES (PROTECTED)
// ────────────────────────────────────────────────────

app.get('/api/me', authenticate, async (req, res) => {
  try {
    const user = await User.findOne(
      { userId: req.user.userId },
      { password: 0 }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/users', authenticate, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/profile/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findOne(
      { userId: req.params.userId },
      { password: 0 }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/users/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await User.find(
      { userId: { $ne: userId } },
      { password: 0 }
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────
//  FOLLOW / UNFOLLOW ROUTES (PROTECTED)
// ────────────────────────────────────────────────────

app.post('/api/follow', authenticate, async (req, res) => {
  const currentUser = req.user.userId;
  const { targetUser } = req.body;
  try {
    if (currentUser === targetUser) {
      return res.status(400).json({ error: 'Cannot follow yourself.' });
    }
    
    const target = await User.findOne({ userId: targetUser });
    if (!target) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await User.findOneAndUpdate(
      { userId: currentUser },
      { $addToSet: { following: targetUser } }
    );
    await User.findOneAndUpdate(
      { userId: targetUser },
      { $addToSet: { followers: currentUser } }
    );
    res.status(200).json({ message: 'Followed successfully!' });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/unfollow', authenticate, async (req, res) => {
  const currentUser = req.user.userId;
  const { targetUser } = req.body;
  try {
    await User.findOneAndUpdate(
      { userId: currentUser },
      { $pull: { following: targetUser } }
    );
    await User.findOneAndUpdate(
      { userId: targetUser },
      { $pull: { followers: currentUser } }
    );
    res.status(200).json({ message: 'Unfollowed successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────
//  POST ROUTES (PROTECTED)
// ────────────────────────────────────────────────────

app.post('/api/posts', authenticate, async (req, res) => {
  const userId = req.user.userId;
  const { text } = req.body;
  try {
    if (!text) {
      return res.status(400).json({ error: 'Text is required.' });
    }
    const post = new Post({ userId, text, likes: [] });
    await post.save();
    console.log('✅ Post saved:', post);
    res.status(201).json({ message: 'Post created!', post });
  } catch (err) {
    console.log('Post error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/posts', authenticate, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.post('/api/posts/:postId/like', authenticate, async (req, res) => {
  const userId = req.user.userId;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      await Post.findByIdAndUpdate(
        req.params.postId,
        { $pull: { likes: userId } }
      );
      const updated = await Post.findById(req.params.postId);
      res.status(200).json({ message: 'Unliked!', post: updated });
    } else {
      await Post.findByIdAndUpdate(
        req.params.postId,
        { $addToSet: { likes: userId } }
      );
      const updated = await Post.findById(req.params.postId);
      res.status(200).json({ message: 'Liked!', post: updated });
    }
  } catch (err) {
    console.log('Like error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/api/posts/user/:userId', authenticate, async (req, res) => {
  try {
    const posts = await Post.find(
      { userId: req.params.userId }
    ).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.delete('/api/posts/:postId', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    
    if (post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own posts.' });
    }
    
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: 'Post deleted!' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ────────────────────────────────────────────────────
//  ROOT ROUTE - API Information
//  ⚠️ MUST be AFTER all other routes and BEFORE app.listen()
// ────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    message: 'Social Media API is running! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/register',
        signin: 'POST /api/signin',
        me: 'GET /api/me (requires token)'
      },
      users: {
        all: 'GET /api/users (requires token)',
        profile: 'GET /api/profile/:userId (requires token)',
        usersExcept: 'GET /api/users/:userId (requires token)'
      },
      posts: {
        create: 'POST /api/posts (requires token)',
        all: 'GET /api/posts (requires token)',
        like: 'POST /api/posts/:postId/like (requires token)',
        userPosts: 'GET /api/posts/user/:userId (requires token)',
        delete: 'DELETE /api/posts/:postId (requires token)'
      },
      follow: {
        follow: 'POST /api/follow (requires token)',
        unfollow: 'POST /api/unfollow (requires token)'
      }
    }
  });
});

// ────────────────────────────────────────────────────
//  404 HANDLER - Must be LAST
// ────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'Please check the API documentation at GET /'
  });
});

// ────────────────────────────────────────────────────
//  START SERVER
// ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/`);
});