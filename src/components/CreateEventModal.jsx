import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CreateEventModal.css';

const CreateEventModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    disabled_friendly: false,
    start_time: '',
    end_time: '',
    location: '',
    additional_information: '',
    max_participants: '',
    max_volunteers: ''
  });
  const [error, setError] = useState(null);

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

    if (!formData.start_time) {
      setError('Start time is required');
      setLoading(false);
      return;
    }

    if (!formData.end_time) {
      setError('End time is required');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          eventName: formData.eventName,
          eventDescription: formData.eventDescription,
          disabled_friendly: formData.disabled_friendly,
          start_time: formData.start_time.replace('T', ' '),
          end_time: formData.end_time.replace('T', ' '),
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
        setError(data.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Event</h3>
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
              <label htmlFor="start_time">Start Time *</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time *</label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={formData.end_time}
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

            <div className="modal-footer">
              <button type="button" className="btn btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-create" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span className="spinner"></span>
                    Creating...
                  </span>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
