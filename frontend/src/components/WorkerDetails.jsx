// WorkerDetails.jsx — Direct booking flow (no Cart, no Stripe)
import React, { useContext, useState } from 'react';
import './WorkerDetails.css';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const TIME_SLOTS = [
  '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM',
  '2:00 PM - 3:00 PM',
  '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM',
  '5:00 PM - 6:00 PM',
];

const today = new Date().toISOString().split('T')[0];

const WorkerDetails = ({ workers }) => {
  const { authToken, currentUser, isAuthenticated } = useContext(AuthContext);

  // No scheduling operations permitted anymore contextually here.

  // Helper: buffer → base64 image URL
  const bufferToImageUrl = (profileData) => {
    try {
      if (!profileData || !profileData.data) return null;
      if (typeof profileData.data === 'string') {
        return `data:${profileData.contentType || 'image/jpeg'};base64,${profileData.data}`;
      }
      let base64String;
      if (profileData.data.data) {
        base64String = Buffer.from(profileData.data.data).toString('base64');
      } else if (Array.isArray(profileData.data)) {
        base64String = Buffer.from(profileData.data).toString('base64');
      } else {
        return null;
      }
      return `data:${profileData.contentType || 'image/jpeg'};base64,${base64String}`;
    } catch {
      return null;
    }
  };

  const getWorkerRole = (workerTypes) => {
    if (!workerTypes) return 'Service Provider';
    const roles = [];
    if (workerTypes.acRepair) roles.push('AC Repair Technician');
    if (workerTypes.mechanicRepair) roles.push('Mechanic');
    if (workerTypes.electricalRepair) roles.push('Electrician');
    if (workerTypes.electronicRepair) roles.push('Electronics Repair Technician');
    if (workerTypes.plumber) roles.push('Plumber');
    if (workerTypes.packersMovers) roles.push('Packers & Movers');
    return roles.length > 0 ? roles.join(', ') : 'Service Provider';
  };

  return (
    <div className="workers-grid">
      {workers.map((worker, index) => {
        const id = worker._id || index;
        const s = getState(id);
        const imageUrl = worker.profilePhoto ? bufferToImageUrl(worker.profilePhoto) : null;

        return (
          <div key={id} className="worker-card">
            {/* Card Header */}
            <div className="worker-header">
              <div className="worker-photo">
                {imageUrl ? (
                  <img src={imageUrl} alt={worker.fullName} />
                ) : (
                  <div className="placeholder-photo">
                    {worker.fullName ? worker.fullName.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div className="worker-basic-info">
                <h3 className="worker-name">{worker.fullName}</h3>
                <div className="worker-role">{getWorkerRole(worker.workerTypes)}</div>
                <div className="worker-rating">
                  <span className="stars">★★★★☆</span>
                  <span className="rating-value">4.0</span>
                </div>
              </div>
            </div>

            {/* Worker Details */}
            <div className="worker-details">
              <div className="detail-item">
                <span className="detail-label">Contact:</span>
                <span className="detail-value">{worker.phoneNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{worker.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{worker.city}, {worker.state}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{worker.address}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{worker.age}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{worker.gender}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Cost per hour:</span>
                <span className="detail-value">
                  {worker.costPerHour ? `₹${worker.costPerHour}` : 'Not specified'}
                </span>
              </div>
              <div className="detail-item service-schedule">
                <span className="detail-label">Availability:</span>
                <span className="detail-value">Mon-Sat, 9 AM - 6 PM</span>
              </div>
            </div>

            {/* Action Buttons Removed for Dispatch Model */}
          </div>
        );
      })}
    </div>
  );
};

export default WorkerDetails;
