import express from 'express';
import { login, register } from '../controllers/authController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
