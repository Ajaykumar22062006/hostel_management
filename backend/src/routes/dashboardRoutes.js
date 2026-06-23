import express from 'express';
import prisma from '../lib/prisma.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();
router.use(verifyToken);

router.get('/admin', requireRole(['ADMIN', 'WARDEN']), async (req, res) => {
  try {
    const [totalStudents, availableRooms, pendingComplaints, fees] = await prisma.$transaction([
      prisma.student.count(),
      prisma.room.aggregate({ _sum: { capacity: true, currentOccupancy: true } }),
      prisma.complaint.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.fee.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } })
    ]);
    
    const capacity = availableRooms._sum.capacity || 0;
    const occupancy = availableRooms._sum.currentOccupancy || 0;

    res.json({
      totalStudents,
      availableRooms: capacity - occupancy,
      pendingComplaints,
      feeCollected: fees._sum.amount || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Analytics error' });
  }
});

router.get('/student', requireRole(['STUDENT']), async (req, res) => {
  try {
    const studentId = req.user.studentId;
    
    const [fees, complaints, allocation] = await Promise.all([
      prisma.fee.findMany({ where: { studentId, status: 'PENDING' } }),
      prisma.complaint.count({ where: { studentId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.allocation.findFirst({ 
        where: { studentId, status: 'ACTIVE' },
        include: { room: true }
      })
    ]);

    const totalPendingFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    // Find earliest due date
    const upcomingDue = fees.length > 0 
      ? fees.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))[0].dueDate 
      : null;

    res.json({
      pendingFees: totalPendingFees,
      upcomingDue: upcomingDue ? new Date(upcomingDue).toISOString().split('T')[0] : 'None',
      activeComplaints: complaints,
      room: allocation ? `${allocation.room.roomNumber}` : 'Not Allocated'
    });
  } catch (error) {
    res.status(500).json({ error: 'Analytics error' });
  }
});

export default router;
