import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Table.css';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rooms');
      setRooms(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading rooms...</div>;

  return (
    <div className="page-container">
      <div className="page-header flex justify-between items-center mb-4">
        <div>
          <h1 className="page-title">Room Allocations</h1>
          <p className="page-subtitle">Manage hostels, rooms, and student assignments.</p>
        </div>
        {user.role === 'ADMIN' && (
          <button className="btn btn-primary">Allocate Student</button>
        )}
      </div>

      <div className="card table-card full-width">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hostel Block</th>
                <th>Room Number</th>
                <th>Capacity</th>
                <th>Occupancy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center empty-state border-none">
                    No rooms found.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => {
                  const isFull = room.currentOccupancy >= room.capacity;
                  return (
                  <tr key={room.id}>
                    <td className="font-medium">{room.hostel.name} ({room.hostel.type})</td>
                    <td>{room.roomNumber}</td>
                    <td>{room.capacity}</td>
                    <td>{room.currentOccupancy}</td>
                    <td>
                      {isFull ? (
                        <span className="badge badge-danger">Full</span>
                      ) : (
                        <span className="badge badge-success">Available</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline">Details</button>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
