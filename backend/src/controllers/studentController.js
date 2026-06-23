import prisma from '../lib/prisma.js';

export const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { email: true, role: true } },
        allocations: { include: { room: { include: { hostel: true } } }, where: { status: 'ACTIVE' } }
      }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { email: true } },
        allocations: { include: { room: { include: { hostel: true } } } },
        fees: true,
        complaints: true
      }
    });
    
    if (!student) return res.status(404).json({ error: 'Student not found' });
    
    // Authorization: A student can only view their own profile
    if (req.user.role === 'STUDENT' && req.user.studentId !== student.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
};

export const createStudent = async (req, res) => {
  // Handled mostly by auth registration, but we can allow admin to create independent profiles
  // For simplicity assuming Admin registers them via auth/register with role STUDENT
  res.status(501).json({ error: 'Use /api/auth/register for creating new students' });
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, year, contact, address } = req.body;

    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { name, department, year, contact, address }
    });

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student' });
  }
};
