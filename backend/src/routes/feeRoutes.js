import express from 'express';
import { getFees, createFee, payFee } from '../controllers/feeController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getFees);
router.post('/', requireRole(['ADMIN', 'WARDEN']), createFee);
router.put('/:id/pay', payFee); // Student pays or Admin marks paid

export default router;
