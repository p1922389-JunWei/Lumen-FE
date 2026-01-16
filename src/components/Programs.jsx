import React, { useState, useEffect } from 'react';
import ScheduleSidebar from './ScheduleSidebar';
import { useAuth } from '../context/AuthContext';
import './Pages.css';

const Programs = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { getToken, user } = useAuth();

  // Form state for creating events
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    disabled_friendly: true,
    datetime: '',
    location: '',
    additional_information: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/events');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      setError('Error loading events: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = getToken();
    
    if (!token) {
      setError('Please login to create events');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setShowCreateForm(false);
        setFormData({
          eventName: '',
          eventDescription: '',
          disabled_friendly: true,
          datetime: '',
          location: '',
          additional_information: ''
        });
        fetchEvents(); // Refresh the list
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (err) {
      setError('Error creating event: ' + err.message);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-SG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="schedule-main">
        <div className="schedule-header">
          <h1>Programs & Events</h1>
          {user && user.role === 'staff' && (
            <button 
              className="btn-create-event"
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {showCreateForm ? 'Cancel' : '+ Create New Event'}
            </button>
          )}
        </div>

        {error && (
          <div style={{
            padding: '10px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '5px',
            margin: '10px 0'
          }}>
            {error}
          </div>
        )}

        {showCreateForm && user && user.role === 'staff' && (
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h2 style={{ marginTop: 0 }}>Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea
                  required
                  value={formData.eventDescription}
                  onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.datetime}
                  onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.disabled_friendly}
                    onChange={(e) => setFormData({ ...formData, disabled_friendly: e.target.checked })}
                  />
                  <span>Disabled Friendly</span>
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Additional Information
                </label>
                <textarea
                  value={formData.additional_information}
                  onChange={(e) => setFormData({ ...formData, additional_information: e.target.value })}
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Create Event
              </button>
            </form>
          </div>
        )}

        <div className="page-content">
          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
            <p>No events found. Create your first event!</p>
          ) : (
            <div style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
            }}>
              {events.map((event) => (
                <div
                  key={event.eventID}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>
                    {event.eventName}
                  </h3>
                  
                  <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                    <strong>📅</strong> {formatDateTime(event.datetime)}
                  </div>
                  
                  <div style={{ marginBottom: '10px', color: '#666', fontSize: '14px' }}>
                    <strong>📍</strong> {event.location}
                  </div>

                  {event.disabled_friendly && (
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginBottom: '10px'
                    }}>
                      ♿ Disabled Friendly
                    </div>
                  )}

                  <p style={{ 
                    color: '#555', 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    marginBottom: '10px'
                  }}>
                    {event.eventDescription}
                  </p>

                  {event.additional_information && (
                    <div style={{
                      marginTop: '10px',
                      padding: '10px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#666'
                    }}>
                      <strong>ℹ️ Note:</strong> {event.additional_information}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Programs;
