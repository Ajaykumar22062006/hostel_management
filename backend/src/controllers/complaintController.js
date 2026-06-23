import prisma from '../lib/prisma.js';

export const getComplaints = async (req, res) => {
  try {
    let filters = {};
    if (req.user.role === 'STUDENT') {
      filters.studentId = req.user.studentId;
    }
    const complaints = await prisma.complaint.findMany({
      where: filters,
      include: {
        student: { select: { id: true, name: true, rollNumber: true, allocations: { where: { status: 'ACTIVE'}, include: {room: true} } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

export const createComplaint = async (req, res) => {
  try {
    const { category, description } = req.body;
    const complaint = await prisma.complaint.create({
      data: {
        studentId: req.user.studentId,
        category,
        description
      }
    });
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    const complaint = await prisma.complaint.update({
      where: { id: parseInt(id) },
      data: { status, remarks }
    });
    
    res.json({ message: 'Complaint updated', complaint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};
