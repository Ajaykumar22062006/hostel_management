import prisma from '../lib/prisma.js';

export const getFees = async (req, res) => {
  try {
    const filters = {};
    if (req.user.role === 'STUDENT') {
      filters.studentId = req.user.studentId;
    }
    const fees = await prisma.fee.findMany({
      where: filters,
      include: {
        student: { select: { id: true, name: true, rollNumber: true } }
      },
      orderBy: { dueDate: 'desc' }
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
};

export const createFee = async (req, res) => {
  try {
    const { studentId, amount, dueDate, month } = req.body;
    const fee = await prisma.fee.create({
      data: {
        studentId,
        amount,
        dueDate: new Date(dueDate),
        month
      }
    });
    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create fee record' });
  }
};

export const payFee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app we would integrate Stripe/Razorpay here
    // For this prototype, we directly mark as PAID
    const fee = await prisma.fee.update({
      where: { id: parseInt(id) },
      data: {
        status: 'PAID',
        paidDate: new Date()
      }
    });
    
    res.json({ message: 'Fee marked as paid', fee });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process fee payment' });
  }
};
