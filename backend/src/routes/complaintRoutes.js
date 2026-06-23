import express from 'express';
import { getComplaints, createComplaint, updateComplaintStatus } from '../controllers/complaintController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getComplaints);
router.post('/', requireRole(['STUDENT']), createComplaint);
router.put('/:id/status', requireRole(['ADMIN', 'WARDEN']), updateComplaintStatus);

export default router;
