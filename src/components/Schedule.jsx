import React, { useState, useEffect } from 'react';
import './Schedule.css';
import ScheduleSidebar from './ScheduleSidebar';
import ScheduleCalendar from './ScheduleCalendar';
import EventModal from './EventModal';
import DatePickerModal from './DatePickerModal';
import CreateEventModal from './CreateEventModal';
import EditEventModal from './EditEventModal';
import Toast from './Toast';
import { useAuth } from '../context/AuthContext';

const Schedule = () => {
  const { user, getToken } = useAuth();
  const [viewType, setViewType] = useState('week');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRegisteredEvents, setUserRegisteredEvents] = useState([]);
  const [toast, setToast] = useState(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const getWeekRange = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const monday = new Date(date);
    monday.setDate(diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
  };

  const formatDateRange = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (viewType === 'week') {
      const { start, end } = getWeekRange(currentDate);
      return `${months[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} - ${months[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
  }, [user]);

  const fetchUserRegisteredEvents = async () => {
    if (!user) return [];
    
    try {
      const endpoint = user.role === 'participant'
        ? `http://localhost:3001/api/participants/${user.userID}/events`
        : `http://localhost:3001/api/volunteers/${user.userID}/events`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        // Store just the event IDs for quick lookup
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
      
      // Use provided registeredEventIds or fall back to state
      const registeredIds = registeredEventIds !== null ? registeredEventIds : userRegisteredEvents;
      
      if (data.success) {
        // Transform API events to calendar format
        const transformedEvents = data.data.map(event => {
          const eventDate = new Date(event.datetime);
          const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          // Format time (e.g., "9:00 AM")
          const hours = eventDate.getHours();
          const minutes = eventDate.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          // Determine event type based on location or description
          let eventType = 'Event';
          if (event.location.toLowerCase().includes('home') || event.location.toLowerCase().includes('visit')) {
            eventType = 'Home Visit';
          } else if (event.eventName.toLowerCase().includes('call') || event.eventName.toLowerCase().includes('video')) {
            eventType = 'Video Call';
          } else if (event.location.toLowerCase().includes('hospital') || event.location.toLowerCase().includes('clinic')) {
            eventType = 'Meeting';
          }
          return {
            id: event.eventID,
            title: event.eventName,
            time: time,
            duration: '1 hour', // Default duration, could be calculated if stored
            type: eventType,
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
            isUserRegistered: registeredIds.includes(event.eventID),
            eventData: event // Keep original data for modal
          };
        });
        setEvents(transformedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/events/${eventId}`);
      const data = await response.json();
      
      if (data.success) {
        const event = data.data;
        const eventDate = new Date(event.datetime);
        const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        
        const hours = eventDate.getHours();
        const minutes = eventDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        
        let eventType = 'Event';
        if (event.location.toLowerCase().includes('home') || event.location.toLowerCase().includes('visit')) {
          eventType = 'Home Visit';
        } else if (event.eventName.toLowerCase().includes('call') || event.eventName.toLowerCase().includes('video')) {
          eventType = 'Video Call';
        } else if (event.location.toLowerCase().includes('hospital') || event.location.toLowerCase().includes('clinic')) {
          eventType = 'Meeting';
        }

        return {
          id: event.eventID,
          title: event.eventName,
          time: time,
          duration: '1 hour',
          type: eventType,
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
          isUserRegistered: userRegisteredEvents.includes(event.eventID)
        };
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
    return null;
  };

  const handleEventClick = async (event) => {
    // Fetch full event details including participants/volunteers
    const detailedEvent = await fetchEventDetails(event.id);
    setSelectedEvent(detailedEvent || event);
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
        // Refresh user registered events first, then fetch all events to update calendar
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
        // Refresh user registered events first, then fetch all events to update calendar
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

  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="schedule-main">
        <div className="schedule-header">
          <h1>Schedule</h1>
          <div className="schedule-controls">
            <div className="view-toggles">
              <button 
                className={viewType === 'week' ? 'active' : ''} 
                onClick={() => setViewType('week')}
              >
                Week
              </button>
              <button 
                className={viewType === 'month' ? 'active' : ''} 
                onClick={() => setViewType('month')}
              >
                Month
              </button>
            </div>
            <div className="date-navigation">
              <button className="nav-btn" onClick={navigatePrev}>‹</button>
              <div className="date-range" onClick={() => setShowDatePicker(true)}>
                <span>{formatDateRange()}</span>
                <span className="dropdown-icon">▼</span>
              </div>
              <button className="nav-btn" onClick={navigateNext}>›</button>
              <button className="today-btn" onClick={goToToday}>Today</button>
            </div>
            <div className="header-actions">
              {user?.role === 'staff' && (
                <button 
                  className="btn btn-create-event"
                  onClick={() => setShowCreateEvent(true)}
                  style={{ backgroundColor: '#4caf50', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  + Create Event
                </button>
              )}
              <button className="search-btn">🔍</button>
              <button className="settings-btn">⚙️</button>
            </div>
                      </div>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            Loading events...
          </div>
        ) : (
          <ScheduleCalendar 
            key={`calendar-${events.length}-${userRegisteredEvents.join(',')}`}
            events={events} 
            onEventClick={handleEventClick}
            userRole={user?.role}
            viewType={viewType}
            currentDate={currentDate}
          />
        )}
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
      {showDatePicker && (
        <DatePickerModal
          currentDate={currentDate}
          onSelect={(date) => {
            setCurrentDate(date);
            setShowDatePicker(false);
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}
      {showCreateEvent && (
        <CreateEventModal 
          onClose={() => setShowCreateEvent(false)}
          onSuccess={() => {
            setToast({ message: 'Event created successfully!', type: 'success' });
            fetchEvents();
          }}
        />
      )}
      {editingEvent && (
        <EditEventModal 
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            setToast({ message: 'Event updated successfully!', type: 'success' });
            fetchEvents();
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

export default Schedule;