import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting clear and seed...');
  
  // Clean up
  await prisma.fee.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const password = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: { email: 'admin@university.edu', password, role: 'ADMIN' }
  });

  const warden = await prisma.user.create({
    data: { email: 'warden@university.edu', password, role: 'WARDEN' }
  });

  // Create Hostels and Rooms
  const blockA = await prisma.hostel.create({
    data: { name: 'Block A', type: 'Boys' }
  });
  
  const blockB = await prisma.hostel.create({
    data: { name: 'Block B', type: 'Girls' }
  });

  const roomA101 = await prisma.room.create({
    data: { hostelId: blockA.id, roomNumber: '101', capacity: 2, currentOccupancy: 1 }
  });

  const roomB201 = await prisma.room.create({
    data: { hostelId: blockB.id, roomNumber: '201', capacity: 2, currentOccupancy: 0 }
  });

  // Create Students
  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@student.edu',
      password,
      role: 'STUDENT',
      student: {
        create: {
          name: 'John Doe', rollNumber: 'CS2026-001', department: 'Computer Science', year: 2, contact: '1234567890', address: '123 Tech St.'
        }
      }
    },
    include: { student: true }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@student.edu',
      password,
      role: 'STUDENT',
      student: {
        create: {
          name: 'Jane Smith', rollNumber: 'EE2026-045', department: 'Electrical Engineering', year: 3, contact: '0987654321', address: '456 Spark Ave.'
        }
      }
    },
    include: { student: true }
  });

  // Allocations
  await prisma.allocation.create({
    data: { studentId: user1.student.id, roomId: roomA101.id, startDate: new Date('2026-08-01') }
  });

  // Fees
  await prisma.fee.create({
    data: { studentId: user1.student.id, amount: 15000, status: 'PENDING', dueDate: new Date('2026-11-01'), month: 'Fall 2026' }
  });
  await prisma.fee.create({
    data: { studentId: user2.student.id, amount: 15000, status: 'PAID', dueDate: new Date('2026-11-01'), month: 'Fall 2026', paidDate: new Date('2026-10-15') }
  });

  // Complaints
  await prisma.complaint.create({
    data: { studentId: user1.student.id, category: 'Maintenance', description: 'AC is not cooling properly in room 101.', status: 'OPEN' }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
