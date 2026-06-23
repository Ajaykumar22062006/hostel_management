import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // First try to fetch real data
      const res = await axios.get('http://localhost:5000/api/students');
      
      // If the DB is completely empty and there are 0 students, let's show the sample data as requested!
      if (res.data.length === 0) {
        setStudents([
          { id: 1, rollNumber: 'STU2023001', name: 'Alice Brown', department: 'B.Sc Computer Science', room: 'B101', contact: '5551112222', status: 'ACTIVE' },
          { id: 2, rollNumber: 'STU2023002', name: 'Bob White', department: 'B.Eng Mechanical', room: 'A102', contact: '5553334444', status: 'ACTIVE' },
          { id: 3, rollNumber: 'STU2024003', name: 'Charlie Davis', department: 'B.A History', room: 'A102', contact: '5555556666', status: 'ACTIVE' },
          { id: 4, rollNumber: 'STU2023004', name: 'Diana Evans', department: 'B.Sc Physics', room: 'B102', contact: '5557778888', status: 'ACTIVE' },
          { id: 5, rollNumber: '123', name: 'Vishnu R', department: 'CSE', room: 'Not assigned', contact: '1234567890', status: 'ACTIVE' },
          { id: 6, rollNumber: 'sss5410s', name: 'Sam A', department: 'ECE', room: 'Not assigned', contact: '645212211', status: 'ACTIVE' }
        ]);
      } else {
        // Map the real data to match our presentation layer nicely
        const mappedRealData = res.data.map(student => ({
          id: student.id,
          rollNumber: student.rollNumber,
          name: student.name,
          department: student.department || 'Unknown',
          room: student.allocations && student.allocations.length > 0 ? student.allocations[0].room.roomNumber : 'Not assigned',
          contact: student.contact || 'N/A',
          status: 'ACTIVE' // Simplified for demo
        }));
        setStudents(mappedRealData);
      }
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Students</h2>
          <p className="text-slate-400 mt-1">Students Management</p>
        </div>
        
        {user?.role !== 'STUDENT' && (
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white px-5 py-2.5 rounded-lg font-medium shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:-translate-y-0.5">
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700/50 text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-600 text-slate-300 transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-4 text-indigo-400 font-medium">Loading records...</p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No students matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr 
                    key={student.id + '-' + idx} 
                    className="hover:bg-slate-800/40 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 font-mono text-slate-300">{student.rollNumber}</td>
                    <td className="px-6 py-4 font-medium text-slate-200">{student.name}</td>
                    <td className="px-6 py-4 text-slate-400">{student.department}</td>
                    <td className="px-6 py-4">
                      {student.room === 'Not assigned' ? (
                        <span className="text-slate-500 italic">{student.room}</span>
                      ) : (
                        <span className="text-slate-300 font-medium">{student.room}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{student.contact}</td>
                    <td className="px-6 py-4">
                      {student.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          {student.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors" title="View details">
                          <Eye size={18} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors" title="Edit record">
                          <Pencil size={18} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Delete record">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;
