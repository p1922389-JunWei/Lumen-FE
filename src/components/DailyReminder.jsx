import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatTime, getRelativeDateLabel } from '../lib/timezone';
import './DailyReminder.css';

const DailyReminder = ({ onClose, onEventClick }) => {
  const { user, getToken } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [user]);

  const fetchUpcomingEvents = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = getToken();
      const endpoint = user.role === 'participant'
        ? `http://localhost:3001/api/participants/${user.userID}/events`
        : `http://localhost:3001/api/volunteers/${user.userID}/events`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Filter for upcoming events (today and future)
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const upcoming = data.data
          .filter(event => {
            const eventDate = new Date(event.start_time);
            return eventDate >= now;
          })
          .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
          .slice(0, 5); // Show max 5 upcoming events

        setUpcomingEvents(upcoming);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleEventClick = (event) => {
    if (onEventClick) {
      onEventClick({
        id: event.eventID,
        title: event.eventName,
        ...event
      });
    }
    onClose();
  };

  return (
    <div className="daily-reminder-overlay" onClick={onClose}>
      <div className="daily-reminder-modal" onClick={(e) => e.stopPropagation()}>
        <button className="daily-reminder-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="daily-reminder-header">
          <div className="daily-reminder-icon">
            <Bell size={28} />
          </div>
          <h2>{getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}!</h2>
          <p className="daily-reminder-subtitle">
            Here's what you have coming up
          </p>
        </div>

        <div className="daily-reminder-content">
          {loading ? (
            <div className="daily-reminder-loading">
              <div className="loading-spinner"></div>
              <p>Loading your events...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="daily-reminder-empty">
              <Calendar size={48} className="empty-icon" />
              <h3>No upcoming events</h3>
              <p>You don't have any events scheduled. Check out the calendar to find activities to join!</p>
            </div>
          ) : (
            <div className="daily-reminder-events">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={event.eventID} 
                  className={`reminder-event-card ${index === 0 ? 'next-event' : ''}`}
                  onClick={() => handleEventClick(event)}
                >
                  {index === 0 && (
                    <div className="next-event-badge">Next Up</div>
                  )}
                  <div className="reminder-event-date">
                    <span className="event-day">{getRelativeDateLabel(event.start_time)}</span>
                  </div>
                  <div className="reminder-event-details">
                    <h4 className="reminder-event-title">{event.eventName}</h4>
                    <div className="reminder-event-meta">
                      <span className="reminder-meta-item">
                        <Clock size={14} />
                        {formatTime(event.start_time)}
                      </span>
                      <span className="reminder-meta-item">
                        <MapPin size={14} />
                        {event.location || 'TBA'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="reminder-event-arrow" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="daily-reminder-footer">
          <button className="daily-reminder-dismiss" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// Floating button component to trigger the reminder
export const ReminderButton = ({ onClick, hasUpcoming }) => {
  return (
    <button 
      className={`floating-reminder-button ${hasUpcoming ? 'has-events' : ''}`}
      onClick={onClick}
      title="View upcoming events"
    >
      <Bell size={24} />
      {hasUpcoming && <span className="reminder-dot"></span>}
    </button>
  );
};

export default DailyReminder;
