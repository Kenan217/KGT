import { Router } from 'express';
import { CodeCategory } from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

/* ── Get all code categories ── */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await CodeCategory.find().sort({ order: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Create category (admin) ── */
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, codes } = req.body;
    const count = await CodeCategory.countDocuments();
    const cat = await CodeCategory.create({ name, description, codes: codes || [], order: count });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Update category (admin) ── */
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const cat = await CodeCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Delete category (admin) ── */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await CodeCategory.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
