import React, { useState } from 'react';
import { Accessibility, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './EventModal.css';

const EventModal = ({ event, onClose, onReserve, onUnregister }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check if event is full based on user role
  const isFull = () => {
    if (!event) return false;
    
    if (user?.role === 'participant') {
      return event.registered_participants >= event.max_participants;
    } else if (user?.role === 'volunteer') {
      return event.registered_volunteers >= event.max_volunteers;
    }
    return false;
  };

  // Check if user is already registered
  const isRegistered = () => {
    if (!event || !user) return false;
    
    if (user.role === 'participant' && event.participants) {
      return event.participants.some(p => p.userID === user.userID);
    } else if (user.role === 'volunteer' && event.volunteers) {
      return event.volunteers.some(v => v.userID === user.userID);
    }
    return false;
  };

  const handleReserve = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isRegistered()) {
        await onUnregister?.(event.id);
      } else {
        await onReserve?.(event.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const registered = isRegistered();
  const full = isFull();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{event.title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="event-time-section">
            <div className="time-display">
              <span className="time">{event.time}</span>
              <span className="duration">{event.duration}</span>
            </div>
          </div>

          {event.location && (
            <div className="section">
              <h4>📍 Location</h4>
              <p className="section-text">{event.location}</p>
            </div>
          )}

          {event.description && (
            <div className="section">
              <h4>Description</h4>
              <p className="section-text">{event.description}</p>
            </div>
          )}

          {/* Capacity Information */}
          {user?.role === 'staff' && (
            <div className="section">
              <h4>Capacity</h4>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <div className="capacity-item">
                  <Users size={18} />
                  <span>Participants: {event.registered_participants || 0}/{event.max_participants || 0}</span>
                </div>
                <div className="capacity-item">
                  <Users size={18} />
                  <span>Volunteers: {event.registered_volunteers || 0}/{event.max_volunteers || 0}</span>
                </div>
              </div>
            </div>
          )}
/* Staff View: Show registered participants and volunteers */}
          {user?.role === 'staff' && (
            <>
              {event.participants && event.participants.length > 0 && (
                <div className="section">
                  <h4>Registered Participants</h4>
                  <div className="registered-list">
                    {event.participants.map((participant, idx) => (
                      <div key={idx} className="registered-item">
                        <span>{participant.fullName}</span>
                        <span className="registered-date">
                          {new Date(participant.signed_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.volunteers && event.volunteers.length > 0 && (
                <div className="section">
                  <h4>Registered Volunteers</h4>
                  <div className="registered-list">
                    {event.volunteers.map((volunteer, idx) => (
                      <div key={idx} className="registered-item">
                        <span>{volunteer.fullName}</span>
                        <span className="registered-date">
                          {new Date(volunteer.signed_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {
          {(user?.role === 'participant' || user?.role === 'volunteer') && (
            <div className="section">
              <h4>Availability</h4>
              <div className="capacity-item">
                <Users size={18} />
                {user.role === 'participant' ? (
                  <span>{event.max_participants - (event.registered_participants || 0)} participant spots remaining</span>
                ) : (
                  <span>{event.max_volunteers - (event.registered_volunteers || 0)} volunteer spots remaining</span>
                )}
              </div>
            </div>
          {user?.role === 'staff' ? (
            <>
              <button className="btn btn-cancel" onClick={onClose}>Close</button>
              <button className="btn btn-reschedule">Reschedule</button>
              <button className="btn btn-start">Manage Event</button>
            </>
          ) : (user?.role === 'participant' || user?.role === 'volunteer') ? (
            <>
              <button className="btn btn-cancel" onClick={onClose}>Close</button>
              <button 
                className={`btn ${registered ? 'btn-unregister' : 'btn-reserve'}`}
                onClick={handleReserve}
                disabled={loading || (!registered && full)}
                style={{
                  backgroundColor: registered ? '#dc3545' : full ? '#ccc' : '#4caf50',
                  cursor: (loading || (!registered && full)) ? 'not-allowed' : 'pointer',
                  opacity: (loading || (!registered && full)) ? 0.6 : 1
                }}
              >
                {loading ? 'Processing...' : registered ? 'Unregister' : full ? 'Event Full' : 'Reserve Spot'}
              </button>
            </>
          ) : (
            <button className="btn btn-cancel" onClick={onClose}>Close</button>
          )}
            <div className="section">
              <div className="badge" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                <Accessibility size={16} />
                <span>Disabled Friendly</span>
              </div>
            </div>
          )}

          {event.notes && (
            <div className="section">
              <h4>Additional Information</h4>
              <p>{event.notes}</p>
            </div>
          )}

          {event.files && event.files.length > 0 && (
            <div className="section">
              <h4>Files</h4>
              <div className="files-list">
                {event.files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-date">{file.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel">Cancel</button>
          <button className="btn btn-reschedule">Reschedule</button>
          <button className="btn btn-start">Start Session</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
