import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

/* ── Login ── */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, displayName: user.displayName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role, displayName: user.displayName } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Get current user ── */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── List all users (admin) ── */
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Create user (admin) ── */
router.post('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, password, role, displayName } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase().trim(),
      password: hash,
      role: role || 'viewer',
      displayName: displayName || username
    });
    res.json({ id: user._id, username: user.username, role: user.role, displayName: user.displayName });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Username already exists.' });
    res.status(500).json({ error: err.message });
  }
});

/* ── Delete user (admin) ── */
router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
