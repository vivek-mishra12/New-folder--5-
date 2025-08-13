import { Router } from 'express';
import Question from '../models/Question.js';

const router = Router();

router.get('/', async (_req, res) => {
  const qs = await Question.find({}).limit(100);
  res.json(qs);
});

// POST /api/questions/add
router.post('/add', async (req, res) => {
  try {
    const { text, options, correctIndex } = req.body;

    if (!text || !options || options.length !== 4 || correctIndex == null) {
      return res.status(400).json({ ok: false, error: 'Invalid question data' });
    }

    const q = new Question({ text, options, correctIndex });
    await q.save();

    res.json({ ok: true, question: q });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});


export default router;
