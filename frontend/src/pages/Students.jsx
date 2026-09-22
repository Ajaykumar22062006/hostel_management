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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Students</h2>
          <p className="text-slate-500 mt-1">Students Management</p>
        </div>
        
        {user?.role !== 'STUDENT' && (
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5">
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 text-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="mt-4 text-indigo-600 font-semibold">Loading records...</p>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-bold">
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
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No students matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr 
                    key={student.id + '-' + idx} 
                    className="hover:bg-slate-50/80 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 font-mono text-slate-700 font-medium">{student.rollNumber}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{student.name}</td>
                    <td className="px-6 py-4 text-slate-600">{student.department}</td>
                    <td className="px-6 py-4">
                      {student.room === 'Not assigned' ? (
                        <span className="text-slate-400 italic">{student.room}</span>
                      ) : (
                        <span className="text-slate-800 font-semibold">{student.room}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.contact}</td>
                    <td className="px-6 py-4">
                      {student.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {student.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View details">
                          <Eye size={18} />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit record">
                          <Pencil size={18} />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete record">
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
