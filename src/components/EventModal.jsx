import React, { useState, useEffect } from 'react';
import { Accessibility, Users, CheckCircle, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './EventModal.css';

const EventModal = ({ event, onClose, onReserve, onUnregister, onEdit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [optimisticRegistered, setOptimisticRegistered] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

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
    
    // First check the isUserRegistered flag (set on calendar events)
    if (event.isUserRegistered !== undefined) {
      return event.isUserRegistered;
    }
    
    // Fall back to checking participants/volunteers arrays (from detailed event fetch)
    if (user.role === 'participant' && event.participants) {
      return event.participants.some(p => p.userID === user.userID);
    } else if (user.role === 'volunteer' && event.volunteers) {
      return event.volunteers.some(v => v.userID === user.userID);
    }
    return false;
  };

  // Reset optimistic state when modal opens with a new event
  useEffect(() => {
    setOptimisticRegistered(null);
  }, [event?.id]);

  const handleReserve = async () => {
    if (loading) return;
    setLoading(true);
    
    const wasRegistered = isRegistered();
    
    try {
      if (wasRegistered) {
        // Optimistically update UI for unregister
        setOptimisticRegistered(false);
        await onUnregister?.(event.id);
        onClose(); // Close modal after successful unregister
      } else {
        // Optimistically update UI for register
        setOptimisticRegistered(true);
        setShowSuccessAnimation(true);
        await onReserve?.(event.id);
        onClose(); // Close modal after successful register
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticRegistered(null);
      setShowSuccessAnimation(false);
    } finally {
      setLoading(false);
    }
  };

  const actuallyRegistered = isRegistered();
  const registered = optimisticRegistered !== null ? optimisticRegistered : actuallyRegistered;
  const full = isFull();

  // Calculate optimistic capacity for immediate UI feedback
  const getOptimisticCapacity = () => {
    if (optimisticRegistered === null) {
      return {
        participants: event.registered_participants || 0,
        volunteers: event.registered_volunteers || 0
      };
    }
    
    const delta = optimisticRegistered && !actuallyRegistered ? 1 : (!optimisticRegistered && actuallyRegistered ? -1 : 0);
    
    if (user?.role === 'participant') {
      return {
        participants: (event.registered_participants || 0) + delta,
        volunteers: event.registered_volunteers || 0
      };
    } else if (user?.role === 'volunteer') {
      return {
        participants: event.registered_participants || 0,
        volunteers: (event.registered_volunteers || 0) + delta
      };
    }
    
    return {
      participants: event.registered_participants || 0,
      volunteers: event.registered_volunteers || 0
    };
  };

  const optimisticCapacity = getOptimisticCapacity();

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
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                Location
              </h4>
              <p className="section-text">{event.location}</p>
            </div>
          )}

          {event.description && (
            <div className="section">
              <h4>Description</h4>
              <p className="section-text">{event.description}</p>
            </div>
          )}

          {/* Capacity Information (Staff Only) */}
          {user?.role === 'staff' && (
            <div className="section">
              <h4>Capacity</h4>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <div className="capacity-item">
                  <Users size={18} />
                  <span>Participants: <strong className="capacity-number">{optimisticCapacity.participants}</strong>/{event.max_participants ? event.max_participants : '∞'}</span>
                </div>
                <div className="capacity-item">
                  <Users size={18} />
                  <span>Volunteers: <strong className="capacity-number">{optimisticCapacity.volunteers}</strong>/{event.max_volunteers ? event.max_volunteers : '∞'}</span>
                </div>
              </div>
            </div>
          )}

<<<<<<< HEAD
          {/* Staff View: Show registered participants and volunteers */}
=======
          {/* Registered Lists (Staff Only) */}
>>>>>>> 93016508935a01060254fd368ab20b147bd16d14
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

<<<<<<< HEAD
=======
          {/* Availability Text (Participants/Volunteers Only) */}
>>>>>>> 93016508935a01060254fd368ab20b147bd16d14
          {(user?.role === 'participant' || user?.role === 'volunteer') && (
            <div className="section">
              <h4>Availability</h4>
              <div className={`capacity-item ${showSuccessAnimation ? 'capacity-update' : ''}`}>
                <Users size={18} />
                {user.role === 'participant' ? (
                  <span>
                    <strong className="capacity-number">{optimisticCapacity.participants}</strong>/{event.max_participants ? event.max_participants : '∞'} participants registered
                  </span>
                ) : (
                  <span>
                    <strong className="capacity-number">{optimisticCapacity.volunteers}</strong>/{event.max_volunteers ? event.max_volunteers : '∞'} volunteers registered
                  </span>
                )}
              </div>
            </div>
<<<<<<< HEAD
          )}

          {event.disabled_friendly && (
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
        </div>

        <div className="modal-footer">
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
=======
          )}

          {/* Disabled Friendly Badge */}
          {event.disabled_friendly && (
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
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          {user?.role === 'staff' ? (
            <>
              <button className="btn btn-cancel" onClick={onClose}>Close</button>
              <button 
                className="btn btn-start"
                onClick={() => {
                  onEdit?.(event);
                  onClose();
                }}
              >
                Edit Event
              </button>
            </>
          ) : (user?.role === 'participant' || user?.role === 'volunteer') ? (
            <>
              <button className="btn btn-cancel" onClick={onClose}>Close</button>
              <button 
                className={`btn ${registered ? 'btn-reserved' : 'btn-reserve'}`}
                onClick={handleReserve}
                disabled={loading || (!registered && full)}
                style={{
                  backgroundColor: registered ? '#dc3545' : full ? '#ccc' : '#4caf50',
                  color: registered ? 'white' : 'white',
                  cursor: (loading || (!registered && full)) ? 'not-allowed' : 'pointer',
                  opacity: (loading || (!registered && full)) ? 0.6 : 1,
                  position: 'relative',
                  minWidth: '140px'
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span className="spinner"></span>
                    Processing...
                  </span>
                ) : registered ? (
                  'Unreserve'
                ) : full ? (
                  'Event Full'
                ) : (
                  'Reserve Spot'
                )}
              </button>
            </>
          ) : (
            <button className="btn btn-cancel" onClick={onClose}>Close</button>
          )}
>>>>>>> 93016508935a01060254fd368ab20b147bd16d14
        </div>
      </div>
    </div>
  );
};

export default EventModal;