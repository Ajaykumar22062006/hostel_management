# University Hostel Management System

A full-stack responsive web application for managing university hostels, student allocations, fees, and maintenance complaints.

## Tech Stack
- **Frontend**: React (Vite) + Premium Vanilla CSS (Responsive & Glassmorphism UI)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT based Role-Based Access Control (Admin, Warden, Student)

## Features Included
- Beautiful, animated dashboard UI logic.
- Secure role-restricted routing.
- Room and Hostel Allocation Algorithms.
- Fee and Receipts Management.
- Maintenance Complaint Ticketing.

## How to Run Locally

### 1. Database Setup
Ensure you have Docker installed, or a local PostgreSQL instance.
If using Docker, run the provided compose file from the root directory:
```bash
docker-compose up -d
```

### 2. Backend Setup
Open a terminal in the `backend` folder:
```bash
cd backend
npm install
npx prisma db push      # Push schema to database
node prisma/seed.js     # Load sample data
npm run dev
```

### 3. Frontend Setup
Open a new terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```

### 4. Sample Login Credentials
After starting the frontend development server, you can log in using:
- **Admin**: `admin@university.edu` / `password123`
- **Student**: `john.doe@student.edu` / `password123`
- **Warden**: `warden@university.edu` / `password123`

## Architecture Documents
Review the generated `implementation_plan.md` and artifacts in your `.gemini` folder for full API specifics and ER Diagrams.

http://localhost:5173/login
