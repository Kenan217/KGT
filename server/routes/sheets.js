import { Router } from 'express';
import { Sheet, Row } from '../db.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

/* ── Get all sheets ── */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const sheets = await Sheet.find().sort({ order: 1 });
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Reorder sheets (admin) ── */
router.put('/reorder', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, order }, ...]
    if (!Array.isArray(orders)) return res.status(400).json({ error: 'orders array required' });

    const ops = orders.map(item =>
      Sheet.findByIdAndUpdate(item.id, { order: item.order })
    );
    await Promise.all(ops);

    const sheets = await Sheet.find().sort({ order: 1 });
    res.json(sheets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Get single sheet with rows ── */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ error: 'Sheet not found.' });
    const rows = await Row.find({ sheetId: req.params.id }).sort({ section: 1, order: 1 });
    res.json({ sheet, rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Create sheet (admin) ── */
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, columns, sections } = req.body;
    const count = await Sheet.countDocuments();
    const sheet = await Sheet.create({ name, columns: columns || [], sections: sections || [], order: count });
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Update sheet (admin) ── */
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const sheet = await Sheet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Delete sheet (admin) ── */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Sheet.findByIdAndDelete(req.params.id);
    await Row.deleteMany({ sheetId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Add row to sheet (admin) ── */
router.post('/:id/rows', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { section, data } = req.body;
    const count = await Row.countDocuments({ sheetId: req.params.id, section });
    const row = await Row.create({ sheetId: req.params.id, section: section || '', data: data || {}, order: count });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Update row (admin) ── */
router.put('/:id/rows/:rowId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const row = await Row.findByIdAndUpdate(req.params.rowId, { data: req.body.data, section: req.body.section, updatedAt: Date.now() }, { new: true });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── Delete row (admin) ── */
router.delete('/:id/rows/:rowId', authMiddleware, adminOnly, async (req, res) => {
  try {
    await Row.findByIdAndDelete(req.params.rowId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
