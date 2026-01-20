import React, { useState, useEffect } from 'react';
import { Accessibility, Users, CheckCircle, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../lib/timezone';
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
      // If max_participants is null/undefined, event has unlimited capacity
      if (!event.max_participants || event.max_participants === null) return false;
      return event.registered_participants >= event.max_participants;
    } else if (user?.role === 'volunteer') {
      // If max_volunteers is null/undefined, event has unlimited capacity
      if (!event.max_volunteers || event.max_volunteers === null) return false;
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
        participants: event.registered_participants,
        volunteers: event.registered_volunteers
      };
    }
    
    const delta = optimisticRegistered && !actuallyRegistered ? 1 : (!optimisticRegistered && actuallyRegistered ? -1 : 0);
    
    if (user?.role === 'participant') {
      return {
        participants: (event.registered_participants) + delta,
        volunteers: event.registered_volunteers
      };
    } else if (user?.role === 'volunteer') {
      return {
        participants: event.registered_participants,
        volunteers: (event.registered_volunteers) + delta
      };
    }
    
    return {
      participants: event.registered_participants,
      volunteers: event.registered_volunteers
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
            {(event.start_time || event.eventData?.start_time || event.end_time || event.eventData?.end_time) && (
              <div className="time-range" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontSize: '14px', color: '#666' }}>
                {(event.start_time || event.eventData?.start_time) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    <span>Start: {formatDateTime(event.start_time || event.eventData?.start_time)}</span>
                  </div>
                )}
                {(event.end_time || event.eventData?.end_time) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    <span>End: {formatDateTime(event.end_time || event.eventData?.end_time)}</span>
                  </div>
                )}
              </div>
            )}
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

          {/* Registered Lists (Staff Only) */}
          {user?.role === 'staff' && (
            <>
              {event.participants && event.participants.length > 0 && (
                <div className="section">
                  <h4>Registered Participants ({event.participants.length})</h4>
                  <div className="registered-list">
                    {event.participants.map((participant, idx) => (
                      <div key={idx} className="registered-item-card">
                        <div className="registered-item-avatar">
                          {participant.fullName?.charAt(0)?.toUpperCase() || 'P'}
                        </div>
                        <div className="registered-item-info">
                          <div className="registered-item-name">{participant.fullName}</div>
                          {participant.phoneNumber && (
                            <div className="registered-item-detail">
                              📞 {participant.phoneNumber}
                            </div>
                          )}
                          <div className="registered-item-date">
                            Signed up: {new Date(participant.signed_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.volunteers && event.volunteers.length > 0 && (
                <div className="section">
                  <h4>Registered Volunteers ({event.volunteers.length})</h4>
                  <div className="registered-list">
                    {event.volunteers.map((volunteer, idx) => (
                      <div key={idx} className="registered-item-card">
                        <div className="registered-item-avatar volunteer">
                          {volunteer.fullName?.charAt(0)?.toUpperCase() || 'V'}
                        </div>
                        <div className="registered-item-info">
                          <div className="registered-item-name">{volunteer.fullName}</div>
                          {volunteer.email && (
                            <div className="registered-item-detail">
                              ✉️ {volunteer.email}
                            </div>
                          )}
                          <div className="registered-item-date">
                            Signed up: {new Date(volunteer.signed_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!event.participants || event.participants.length === 0) && 
               (!event.volunteers || event.volunteers.length === 0) && (
                <div className="section">
                  <p style={{ color: '#888', fontStyle: 'italic' }}>No registrations yet</p>
                </div>
              )}
            </>
          )}

          {/* Availability Text (Participants/Volunteers Only) */}
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
          )}

          {/* Disabled Friendly Badge */}
          {(event.disabled_friendly === 1 || event.disabled_friendly === true) && (
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
        </div>
      </div>
    </div>
  );
};

export default EventModal;