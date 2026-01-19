import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './EditEventModal.css';

const EditEventModal = ({ event, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    disabled_friendly: false,
    datetime: '',
    location: '',
    additional_information: '',
    max_participants: '',
    max_volunteers: ''
  });
  const [error, setError] = useState(null);

  // Initialize form data with event details
  useEffect(() => {
    if (event) {
      // Format datetime for input
      let formattedDatetime = '';
      if (event.fullDate) {
        const dt = new Date(event.fullDate);
        formattedDatetime = dt.toISOString().slice(0, 16);
      } else if (event.eventData?.datetime) {
        const dt = new Date(event.eventData.datetime);
        formattedDatetime = dt.toISOString().slice(0, 16);
      }

      setFormData({
        eventName: event.title || event.eventData?.eventName || '',
        eventDescription: event.description || event.eventData?.eventDescription || '',
        disabled_friendly: event.disabled_friendly || event.eventData?.disabled_friendly || false,
        datetime: formattedDatetime,
        location: event.location || event.eventData?.location || '',
        additional_information: event.notes || event.eventData?.additional_information || '',
        max_participants: event.max_participants || event.eventData?.max_participants || '',
        max_volunteers: event.max_volunteers || event.eventData?.max_volunteers || ''
      });
    }
  }, [event]);

  // Only render if user is staff
  if (!user || user.role !== 'staff') {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!formData.eventName.trim()) {
      setError('Event name is required');
      setLoading(false);
      return;
    }

    if (!formData.datetime) {
      setError('Date and time are required');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    try {
      const eventId = event.id || event.eventID || event.eventData?.eventID;
      const response = await fetch(`http://localhost:3001/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          eventName: formData.eventName,
          eventDescription: formData.eventDescription,
          disabled_friendly: formData.disabled_friendly,
          datetime: formData.datetime.replace('T', ' '),
          location: formData.location,
          additional_information: formData.additional_information,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          max_volunteers: formData.max_volunteers ? parseInt(formData.max_volunteers) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(data.error || 'Failed to update event');
      }
    } catch (err) {
      setError('Failed to update event. Please try again.');
      console.error('Error updating event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const eventId = event.id || event.eventID || event.eventData?.eventID;
      const response = await fetch(`http://localhost:3001/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(data.error || 'Failed to delete event');
      }
    } catch (err) {
      setError('Failed to delete event. Please try again.');
      console.error('Error deleting event:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Event</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="create-event-form">
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="eventName">Event Name *</label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventDescription">Description</label>
              <textarea
                id="eventDescription"
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleChange}
                placeholder="Enter event description"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="datetime">Date & Time *</label>
              <input
                type="datetime-local"
                id="datetime"
                name="datetime"
                value={formData.datetime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="max_participants">Max Participants</label>
                <input
                  type="number"
                  id="max_participants"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="max_volunteers">Max Volunteers</label>
                <input
                  type="number"
                  id="max_volunteers"
                  name="max_volunteers"
                  value={formData.max_volunteers}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  min="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="additional_information">Additional Information</label>
              <textarea
                id="additional_information"
                name="additional_information"
                value={formData.additional_information}
                onChange={handleChange}
                placeholder="Enter any additional information"
                rows="2"
              />
            </div>

            <div className="form-group checkbox">
              <label htmlFor="disabled_friendly">
                <input
                  type="checkbox"
                  id="disabled_friendly"
                  name="disabled_friendly"
                  checked={formData.disabled_friendly}
                  onChange={handleChange}
                />
                <span>Disabled Friendly</span>
              </label>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                type="button" 
                className="btn btn-delete" 
                onClick={handleDelete}
                disabled={loading}
                style={{ 
                  backgroundColor: '#dc3545', 
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Delete Event
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-create" disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <span className="spinner"></span>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
