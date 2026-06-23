import express from 'express';
import { getHostels, getRooms, allocateRoom, deallocateRoom } from '../controllers/roomController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/hostels', getHostels);
router.get('/', getRooms);

router.post('/allocate', requireRole(['ADMIN', 'WARDEN']), allocateRoom);
router.put('/deallocate/:id', requireRole(['ADMIN', 'WARDEN']), deallocateRoom);

export default router;
