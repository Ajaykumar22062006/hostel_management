import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

export const getStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { email: true, role: true } },
        allocations: { include: { room: { include: { hostel: true } } }, where: { status: 'ACTIVE' } }
      },
      orderBy: { createdAt: 'desc' }
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
  try {
    const { email, password, name, rollNumber, department, year, contact, address } = req.body;

    if (!name || !rollNumber || !email) {
      return res.status(400).json({ error: 'Name, Roll Number, and Email are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User with this email already exists' });

    const existingStudent = await prisma.student.findUnique({ where: { rollNumber } });
    if (existingStudent) return res.status(400).json({ error: 'Student with this roll number already exists' });

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            name,
            rollNumber,
            department: department || 'General',
            year: parseInt(year) || 1,
            contact: contact || '',
            address: address || ''
          }
        }
      },
      include: {
        student: {
          include: {
            user: { select: { email: true, role: true } },
            allocations: { include: { room: { include: { hostel: true } } }, where: { status: 'ACTIVE' } }
          }
        }
      }
    });

    res.status(201).json(user.student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student: ' + error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, year, contact, address } = req.body;

    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { name, department, year: parseInt(year), contact, address },
      include: {
        user: { select: { email: true, role: true } },
        allocations: { include: { room: { include: { hostel: true } } }, where: { status: 'ACTIVE' } }
      }
    });

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student' });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id: parseInt(id) } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    await prisma.user.delete({ where: { id: student.userId } });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Failed to delete student', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

