import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Table.css';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fees');
      setFees(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch fees', error);
      setLoading(false);
    }
  };

  const handlePay = async (feeId) => {
    try {
      await axios.put(`http://localhost:5000/api/fees/${feeId}/pay`);
      fetchFees();
    } catch (error) {
      alert('Payment processing failed');
    }
  };

  if (loading) return <div className="loading">Loading fees...</div>;

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center mb-4">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="page-subtitle">View and manage hostel fee payments.</p>
        </div>
        {user.role === 'ADMIN' && (
          <button className="btn btn-primary">Generate Fee</button>
        )}
      </div>

      <div className="card table-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {user.role !== 'STUDENT' && <th>Student</th>}
                <th>Amount (Rs)</th>
                <th>Month/Term</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={user.role !== 'STUDENT' ? "6" : "5"} className="text-center empty-state border-none">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee.id}>
                    {user.role !== 'STUDENT' && (
                      <td className="font-medium">{fee.student?.name} ({fee.student?.rollNumber})</td>
                    )}
                    <td className="font-medium">₹ {fee.amount}</td>
                    <td>{fee.month}</td>
                    <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                    <td>
                      {fee.status === 'PAID' ? (
                        <span className="badge badge-success">Paid ({new Date(fee.paidDate).toLocaleDateString()})</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </td>
                    <td>
                      {fee.status === 'PENDING' ? (
                        <button className="btn btn-sm btn-primary" onClick={() => handlePay(fee.id)}>
                          Pay Now
                        </button>
                      ) : (
                        <button className="btn btn-sm btn-outline">Receipt</button>
                      )}
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

export default Fees;
