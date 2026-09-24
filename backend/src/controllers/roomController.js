import prisma from '../lib/prisma.js';

export const getHostels = async (req, res) => {
  try {
    const hostels = await prisma.hostel.findMany({
      include: {
        rooms: true
      }
    });
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hostels' });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        hostel: true,
        allocations: {
          where: { status: 'ACTIVE' },
          include: { student: { select: { id: true, name: true, rollNumber: true } } }
        }
      }
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const allocateRoom = async (req, res) => {
  try {
    const { studentId, roomId, startDate } = req.body;

    const parsedStudentId = parseInt(studentId);
    const parsedRoomId = parseInt(roomId);

    if (isNaN(parsedStudentId) || isNaN(parsedRoomId)) {
      return res.status(400).json({ error: 'Valid studentId and roomId are required' });
    }

    // Check capacity
    const room = await prisma.room.findUnique({ where: { id: parsedRoomId } });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.currentOccupancy >= room.capacity) {
      return res.status(400).json({ error: 'Room is already full' });
    }

    // Check if student already has active allocation
    const existing = await prisma.allocation.findFirst({
      where: { studentId: parsedStudentId, status: 'ACTIVE' }
    });
    if (existing) {
      return res.status(400).json({ error: 'Student is already allocated to an active room' });
    }

    // Transaction to update room occupancy and create allocation
    const result = await prisma.$transaction([
      prisma.allocation.create({
        data: {
          studentId: parsedStudentId,
          roomId: parsedRoomId,
          startDate: new Date(startDate || new Date())
        }
      }),
      prisma.room.update({
        where: { id: parsedRoomId },
        data: { currentOccupancy: { increment: 1 } }
      })
    ]);

    res.status(201).json({ message: 'Room allocated successfully', allocation: result[0] });
  } catch (error) {
    console.error('Error in allocateRoom:', error);
    res.status(500).json({ error: 'Failed to allocate room: ' + error.message });
  }
};


export const deallocateRoom = async (req, res) => {
  try {
    const { id } = req.params; // Allocation ID

    const allocation = await prisma.allocation.findUnique({ where: { id: parseInt(id) } });
    if (!allocation || allocation.status === 'INACTIVE') {
      return res.status(400).json({ error: 'Active allocation not found' });
    }

    const result = await prisma.$transaction([
      prisma.allocation.update({
        where: { id: parseInt(id) },
        data: { status: 'INACTIVE', endDate: new Date() }
      }),
      prisma.room.update({
        where: { id: allocation.roomId },
        data: { currentOccupancy: { decrement: 1 } }
      })
    ]);

    res.json({ message: 'Room deallocated successfully', allocation: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deallocate room' });
  }
};
