import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Edit2, Search, Plus, Accessibility } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ScheduleSidebar from './ScheduleSidebar';
import EventModal from './EventModal';
import EditEventModal from './EditEventModal';
import CreateEventModal from './CreateEventModal';
import Toast from './Toast';
import './Activity.css';

const Activity = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [toast, setToast] = useState(null);
  const [userRegisteredEvents, setUserRegisteredEvents] = useState([]);

  const fetchUserRegisteredEvents = async () => {
    if (!user) return [];
    
    try {
      const endpoint = user.role === 'participant'
        ? `http://localhost:3001/api/participants/${user.userID}/events`
        : `http://localhost:3001/api/volunteers/${user.userID}/events`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        const registeredIds = data.data.map(e => e.eventID);
        setUserRegisteredEvents(registeredIds);
        return registeredIds;
      }
    } catch (error) {
      console.error('Error fetching user registered events:', error);
    }
    return [];
  };

  const fetchEvents = async (registeredEventIds = null) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/events');
      const data = await response.json();
      
      const registeredIds = registeredEventIds !== null ? registeredEventIds : userRegisteredEvents;
      
      if (data.success) {
        // Sort events by date
        const sortedEvents = data.data.sort((a, b) => 
          new Date(a.start_time) - new Date(b.start_time)
        );
        
        // Add isUserRegistered flag
        const eventsWithRegistration = sortedEvents.map(event => ({
          ...event,
          isUserRegistered: registeredIds.includes(event.eventID)
        }));
        
        setEvents(eventsWithRegistration);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user && (user.role === 'participant' || user.role === 'volunteer')) {
        const registeredIds = await fetchUserRegisteredEvents();
        await fetchEvents(registeredIds);
      } else {
        await fetchEvents([]);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/events/${eventId}`);
      const data = await response.json();
      
      if (data.success) {
        const event = data.data;
        const eventDate = new Date(event.start_time);
        const endDate = event.end_time ? new Date(event.end_time) : null;
        const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        
        const hours = eventDate.getHours();
        const minutes = eventDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        
        // Calculate duration if end_time exists
        let duration = '1 hour';
        if (endDate) {
          const diffMs = endDate - eventDate;
          const diffMins = Math.round(diffMs / 60000);
          if (diffMins < 60) {
            duration = `${diffMins} min`;
          } else {
            const diffHours = Math.floor(diffMins / 60);
            const remainingMins = diffMins % 60;
            duration = remainingMins > 0 ? `${diffHours}h ${remainingMins}m` : `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
          }
        }

        return {
          id: event.eventID,
          title: event.eventName,
          time: time,
          duration: duration,
          type: 'Event',
          day: dayLabels[eventDate.getDay()],
          date: eventDate.getDate(),
          fullDate: eventDate,
          description: event.eventDescription,
          location: event.location,
          notes: event.additional_information,
          disabled_friendly: event.disabled_friendly,
          max_participants: event.max_participants,
          max_volunteers: event.max_volunteers,
          registered_participants: event.registered_participants,
          registered_volunteers: event.registered_volunteers,
          participants: event.participants,
          volunteers: event.volunteers,
          isUserRegistered: userRegisteredEvents.includes(event.eventID),
          eventData: event
        };
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
    return null;
  };

  const handleReserve = async (eventId) => {
    if (!user) {
      setToast({ message: 'Please log in to reserve a spot', type: 'error' });
      return;
    }

    const endpoint = user.role === 'participant' 
      ? 'http://localhost:3001/api/participant-events'
      : 'http://localhost:3001/api/volunteer-events';

    const idField = user.role === 'participant' ? 'participantID' : 'volunteerID';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [idField]: user.userID,
          eventID: eventId
        })
      });

      const data = await response.json();

      if (data.success) {
        setToast({ 
          message: 'Successfully registered for the event!', 
          type: 'success' 
        });
        const registeredIds = await fetchUserRegisteredEvents();
        await fetchEvents(registeredIds);
        const updatedEvent = await fetchEventDetails(eventId);
        setSelectedEvent(updatedEvent);
      } else {
        setToast({ 
          message: data.error || 'Failed to reserve spot', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error reserving:', error);
      setToast({ 
        message: 'Failed to reserve spot. Please try again.', 
        type: 'error' 
      });
    }
  };

  const handleUnregister = async (eventId) => {
    if (!user) return;

    const endpoint = user.role === 'participant'
      ? `http://localhost:3001/api/participant-events/${user.userID}/${eventId}`
      : `http://localhost:3001/api/volunteer-events/${user.userID}/${eventId}`;

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setToast({ 
          message: 'Successfully unregistered from the event', 
          type: 'info' 
        });
        const registeredIds = await fetchUserRegisteredEvents();
        await fetchEvents(registeredIds);
        const updatedEvent = await fetchEventDetails(eventId);
        setSelectedEvent(updatedEvent);
      } else {
        setToast({ 
          message: data.error || 'Failed to unregister', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error unregistering:', error);
      setToast({ 
        message: 'Failed to unregister. Please try again.', 
        type: 'error' 
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    const startFormatted = formatTime(startTime);
    if (!endTime) return startFormatted;
    const endFormatted = formatTime(endTime);
    return `${startFormatted} - ${endFormatted}`;
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.eventDescription && event.eventDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesTimeFilter = true;
    if (filter === 'upcoming') {
      matchesTimeFilter = isUpcoming(event.start_time);
    } else if (filter === 'past') {
      matchesTimeFilter = !isUpcoming(event.start_time);
    }
    
    return matchesSearch && matchesTimeFilter;
  });

  const handleEventClick = async (event) => {
    const detailedEvent = await fetchEventDetails(event.eventID);
    setSelectedEvent(detailedEvent);
  };

  const handleEditClick = (event, e) => {
    e.stopPropagation();
    const transformedEvent = {
      id: event.eventID,
      eventID: event.eventID,
      title: event.eventName,
      description: event.eventDescription,
      location: event.location,
      fullDate: new Date(event.start_time),
      disabled_friendly: event.disabled_friendly,
      max_participants: event.max_participants,
      max_volunteers: event.max_volunteers,
      notes: event.additional_information,
      eventData: event
    };
    setEditingEvent(transformedEvent);
  };

  return (
    <div className="activity-container">
      <ScheduleSidebar />
      <div className="activity-main">
        <div className="activity-header">
          <div className="activity-title-section">
            <h1>Activities</h1>
            <p className="activity-subtitle">Browse and join upcoming events</p>
          </div>
          <div className="activity-controls">
            <div className="activity-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="activity-filter-tabs">
              <button 
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
                onClick={() => setFilter('past')}
              >
                Past
              </button>
            </div>
            {user?.role === 'staff' && (
              <button 
                className="btn-create-activity"
                onClick={() => setShowCreateEvent(true)}
              >
                <Plus size={18} />
                Create Event
              </button>
            )}
          </div>
        </div>

        <div className="activity-content">
          {loading ? (
            <div className="activity-loading">
              <div className="loading-spinner"></div>
              <p>Loading activities...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="activity-empty">
              <Calendar size={48} />
              <h3>No activities found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="activity-grid">
              {filteredEvents.map((event) => (
                <div 
                  key={event.eventID} 
                  className={`activity-card ${!isUpcoming(event.start_time) ? 'past' : ''} ${event.isUserRegistered ? 'registered' : ''}`}
                  onClick={() => handleEventClick(event)}
                >
                  {event.isUserRegistered && (
                    <div className="registered-badge">Registered</div>
                  )}
                  {!isUpcoming(event.start_time) && (
                    <div className="past-badge">Past Event</div>
                  )}
                  
                  <div className="card-header">
                    <h3 className="card-title">{event.eventName}</h3>
                    {user?.role === 'staff' && (
                      <button 
                        className="card-edit-btn"
                        onClick={(e) => handleEditClick(event, e)}
                        title="Edit event"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="card-details">
                    <div className="card-detail">
                      <Calendar size={16} />
                      <span>{formatDate(event.start_time)}</span>
                    </div>
                    <div className="card-detail">
                      <Clock size={16} />
                      <span>{formatTimeRange(event.start_time, event.end_time)}</span>
                    </div>
                    <div className="card-detail">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {event.eventDescription ? (
                    <p className="card-description">{event.eventDescription}</p>
                  ) : (
                    <div className="card-spacer" style={{ flex: 1 }}></div>
                  )}

                  <div className="card-footer">
                    <div className="card-stats">
                      <div className="stat-item">
                        <Users size={14} />
                        <span>{event.registered_participants}/{event.max_participants || '∞'}</span>
                      </div>
                      <div className="stat-item">
                        <Users size={14} />
                        <span>{event.registered_volunteers}/{event.max_volunteers || '∞'} vol</span>
                      </div>
                    </div>
                    {event.disabled_friendly === 1 || event.disabled_friendly === true ? (
                      <div className="accessible-badge">
                        <Accessibility size={14} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onReserve={handleReserve}
          onUnregister={handleUnregister}
          onEdit={(event) => {
            setSelectedEvent(null);
            setEditingEvent(event);
          }}
        />
      )}

      {editingEvent && (
        <EditEventModal 
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            setToast({ message: 'Event updated successfully!', type: 'success' });
            fetchEvents(userRegisteredEvents);
          }}
        />
      )}

      {showCreateEvent && (
        <CreateEventModal 
          onClose={() => setShowCreateEvent(false)}
          onSuccess={() => {
            setToast({ message: 'Event created successfully!', type: 'success' });
            fetchEvents(userRegisteredEvents);
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Activity;
