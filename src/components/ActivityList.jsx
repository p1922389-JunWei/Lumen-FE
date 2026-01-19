import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Edit2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ActivityList.css';

const ActivityList = ({ onEditEvent, onEventClick }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/events');
      const data = await response.json();
      
      if (data.success) {
        // Sort events by date
        const sortedEvents = data.data.sort((a, b) => 
          new Date(a.datetime) - new Date(b.datetime)
        );
        setEvents(sortedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh events periodically and when component mounts
  useEffect(() => {
    const interval = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date();
  };

  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.eventDescription && event.eventDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Time filter
    let matchesTimeFilter = true;
    if (filter === 'upcoming') {
      matchesTimeFilter = isUpcoming(event.datetime);
    } else if (filter === 'past') {
      matchesTimeFilter = !isUpcoming(event.datetime);
    }
    
    return matchesSearch && matchesTimeFilter;
  });

  const handleEditClick = (event, e) => {
    e.stopPropagation();
    // Transform event to match the format expected by EditEventModal
    const transformedEvent = {
      id: event.eventID,
      eventID: event.eventID,
      title: event.eventName,
      description: event.eventDescription,
      location: event.location,
      fullDate: new Date(event.datetime),
      disabled_friendly: event.disabled_friendly,
      max_participants: event.max_participants,
      max_volunteers: event.max_volunteers,
      notes: event.additional_information,
      eventData: event
    };
    onEditEvent?.(transformedEvent);
  };

  const handleEventClick = (event) => {
    // Transform event for EventModal view
    const eventDate = new Date(event.datetime);
    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const hours = eventDate.getHours();
    const minutes = eventDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    const transformedEvent = {
      id: event.eventID,
      title: event.eventName,
      time: time,
      duration: '1 hour',
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
      eventData: event
    };
    onEventClick?.(transformedEvent);
  };

  // Only show for staff
  if (!user || user.role !== 'staff') {
    return null;
  }

  return (
    <div className="activity-list">
      <div 
        className="activity-list-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="activity-list-title">
          <Calendar size={18} />
          <span>All Activities</span>
          <span className="event-count">{events.length}</span>
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {expanded && (
        <div className="activity-list-content">
          <div className="activity-search">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="activity-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button 
              className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Past
            </button>
          </div>

          {loading ? (
            <div className="activity-loading">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="activity-empty">No events found</div>
          ) : (
            <div className="activity-items">
              {filteredEvents.map((event) => (
                <div 
                  key={event.eventID} 
                  className={`activity-item ${!isUpcoming(event.datetime) ? 'past' : ''}`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="activity-item-header">
                    <div className="activity-item-title">{event.eventName}</div>
                    <button 
                      className="activity-edit-btn"
                      onClick={(e) => handleEditClick(event, e)}
                      title="Edit event"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                  
                  <div className="activity-item-details">
                    <div className="activity-detail">
                      <Calendar size={12} />
                      <span>{formatDate(event.datetime)}</span>
                    </div>
                    <div className="activity-detail">
                      <Clock size={12} />
                      <span>{formatTime(event.datetime)}</span>
                    </div>
                    <div className="activity-detail">
                      <MapPin size={12} />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="activity-item-stats">
                    <div className="stat">
                      <Users size={12} />
                      <span>{event.registered_participants || 0}/{event.max_participants || '∞'} participants</span>
                    </div>
                    <div className="stat">
                      <Users size={12} />
                      <span>{event.registered_volunteers || 0}/{event.max_volunteers || '∞'} volunteers</span>
                    </div>
                  </div>

                  {!isUpcoming(event.datetime) && (
                    <div className="past-badge">Past Event</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityList;
