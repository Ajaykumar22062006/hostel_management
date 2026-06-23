import express from 'express';
import { getStudents, getStudentById, createStudent, updateStudent } from '../controllers/studentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', requireRole(['ADMIN', 'WARDEN']), getStudents);
router.get('/:id', getStudentById);
router.post('/', requireRole(['ADMIN']), createStudent);
router.put('/:id', requireRole(['ADMIN', 'WARDEN']), updateStudent);

export default router;
