import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Table.css';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ category: 'Maintenance', description: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/complaints', newComplaint);
      setIsModalOpen(false);
      fetchComplaints();
      setNewComplaint({ category: 'Maintenance', description: '' });
    } catch (error) {
      alert('Failed to submit complaint');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/status`, { status });
      fetchComplaints();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading complaints...</div>;

  return (
    <div className="page-container relative">
      <div className="page-header flex justify-between items-center mb-4">
        <div>
          <h1 className="page-title">Complaints & Maintenance</h1>
          <p className="page-subtitle">Track and resolve issues raised by students.</p>
        </div>
        {user.role === 'STUDENT' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Raise Issue</button>
        )}
      </div>

      <div className="card table-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                {user.role !== 'STUDENT' && <th>Student Details</th>}
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={user.role !== 'STUDENT' ? "6" : "5"} className="text-center empty-state border-none">
                    No active complaints.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">#TKT-{c.id}</td>
                    {user.role !== 'STUDENT' && (
                      <td>
                        <div className="font-medium">{c.student?.name}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                           Room: {c.student?.allocations?.[0]?.room?.roomNumber || 'Unknown'} (Roll: {c.student?.rollNumber})
                        </div>
                      </td>
                    )}
                    <td><span className="badge badge-primary">{c.category}</span></td>
                    <td style={{maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={c.description}>
                      {c.description}
                    </td>
                    <td>
                      {c.status === 'RESOLVED' && <span className="badge badge-success">Resolved</span>}
                      {c.status === 'IN_PROGRESS' && <span className="badge badge-warning">In Progress</span>}
                      {c.status === 'OPEN' && <span className="badge badge-danger">Open</span>}
                    </td>
                    <td>
                      {user.role === 'STUDENT' ? (
                        <button className="btn btn-sm btn-outline">View</button>
                      ) : (
                        <div className="flex gap-2">
                           {c.status === 'OPEN' && (
                             <button className="btn btn-sm btn-outline" onClick={() => handleStatusUpdate(c.id, 'IN_PROGRESS')}>Start</button>
                           )}
                           {c.status !== 'RESOLVED' && (
                             <button className="btn btn-sm btn-primary" onClick={() => handleStatusUpdate(c.id, 'RESOLVED')}>Resolve</button>
                           )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100}}>
          <div className="card" style={{width: '100%', maxWidth: '400px'}}>
            <h2 className="mb-4">Raise a Complaint</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={newComplaint.category} onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water issue</option>
                  <option value="Cleaning">Cleaning / Hygiene</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="4" required value={newComplaint.description} onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}></textarea>
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Issue</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
