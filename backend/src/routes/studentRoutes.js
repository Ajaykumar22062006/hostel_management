import express from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', requireRole(['ADMIN', 'WARDEN']), getStudents);
router.get('/:id', getStudentById);
router.post('/', requireRole(['ADMIN', 'WARDEN']), createStudent);
router.put('/:id', requireRole(['ADMIN', 'WARDEN']), updateStudent);
router.delete('/:id', requireRole(['ADMIN', 'WARDEN']), deleteStudent);

export default router;

