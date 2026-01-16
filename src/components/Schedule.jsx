import React, { useState, useEffect } from 'react';
import './Schedule.css';
import ScheduleSidebar from './ScheduleSidebar';
import ScheduleCalendar from './ScheduleCalendar';
import EventModal from './EventModal';
import DatePickerModal from './DatePickerModal';

const Schedule = () => {
  const [viewType, setViewType] = useState('week');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/events');
      const data = await response.json();
      
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
          } else {
            eventType = 'Event';
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
            events={events} 
            onEventClick={setSelectedEvent}
            viewType={viewType}
            currentDate={currentDate}
          />
        )}
      </div>
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
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
    </div>
  );
};

export default Schedule;
