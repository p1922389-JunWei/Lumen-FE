import React from 'react';
import './ScheduleCalendar.css';

const ScheduleCalendar = ({ events, onEventClick, viewType = 'week', currentDate }) => {
  const timeSlots = [
    '8 AM',
    '9 AM',
    '10 AM',
    '11 AM',
    'Noon',
    '1 PM',
  ];

  const getWeekDays = () => [
    { label: 'MON', date: 8, fullDate: new Date(2024, 0, 8) },
    { label: 'TUE', date: 9, fullDate: new Date(2024, 0, 9) },
    { label: 'WED', date: 10, fullDate: new Date(2024, 0, 10) },
    { label: 'THU', date: 11, fullDate: new Date(2024, 0, 11) },
    { label: 'FRI', date: 12, fullDate: new Date(2024, 0, 12) },
    { label: 'SAT', date: 13, fullDate: new Date(2024, 0, 13) },
    { label: 'SUN', date: 14, fullDate: new Date(2024, 0, 14) },
  ];

  const getMonthDays = () => {
    const year = 2024;
    const month = 0; // January
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    
    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ 
        date: date.getDate(), 
        fullDate: date,
        isCurrentMonth: false 
      });
    }
    
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ 
        date: i, 
        fullDate: new Date(year, month, i),
        isCurrentMonth: true 
      });
    }
    
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ 
        date: i, 
        fullDate: new Date(year, month + 1, i),
        isCurrentMonth: false 
      });
    }
    
    return days;
  };

  const getEventColor = (type) => {
    const colors = {
      'Video Call': '#E8F5FF',
      'Audio Call': '#FFE8E8',
      'Home Visit': '#FFF8E8',
      'Meeting': '#E8F5E8',
      'Hospital': '#E8F5E8'
    };
    return colors[type] || '#F0F0F0';
  };

  const getEventIcon = (type) => {
    const icons = {
      'Video Call': '📹',
      'Audio Call': '📞',
      'Home Visit': '🏠',
      'Meeting': '📅',
      'Hospital': '🏥'
    };
    return icons[type] || '📌';
  };

  const getEventsForDate = (date) => {
    return events.filter(event => event.date === date);
  };

  if (viewType === 'month') {
    const monthDays = getMonthDays();
    const weekDayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
      <div className="calendar-container month-view">
        <div className="month-header">
          {weekDayLabels.map((day, idx) => (
            <div key={idx} className="month-day-label">{day}</div>
          ))}
        </div>
        <div className="month-grid">
          {monthDays.map((day, idx) => (
            <div 
              key={idx} 
              className={`month-day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${day.date === 10 && day.isCurrentMonth ? 'today' : ''}`}
            >
              <div className="month-day-number">{day.date}</div>
              <div className="month-day-events">
                {day.isCurrentMonth && getEventsForDate(day.date).slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="month-event"
                    style={{ backgroundColor: getEventColor(event.type) }}
                    onClick={() => onEventClick(event)}
                  >
                    <span className="month-event-time">{event.time}</span>
                    <span className="month-event-title">{event.title}</span>
                  </div>
                ))}
                {day.isCurrentMonth && getEventsForDate(day.date).length > 3 && (
                  <div className="month-event-more">
                    +{getEventsForDate(day.date).length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Week view (default)
  const days = getWeekDays();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="time-column"></div>
        {days.map((day, idx) => (
          <div key={idx} className="day-header">
            <div className="day-label">{day.label}</div>
            <div className={`day-date ${day.date === 10 ? 'today' : ''}`}>{day.date}</div>
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {timeSlots.map((time, timeIdx) => (
          <div key={timeIdx} className="time-row">
            <div className="time-slot">{time}</div>
            {days.map((day, dayIdx) => (
              <div key={`${timeIdx}-${dayIdx}`} className="day-slot">
                {events
                  .filter(event => event.date === day.date)
                  .map(event => (
                    <div
                      key={event.id}
                      className="event-card"
                      style={{ backgroundColor: getEventColor(event.type) }}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="event-time">{event.time}</div>
                      <div className="event-title">{event.title}</div>
                      <div className="event-meta">
                        <span className="event-icon">{getEventIcon(event.type)}</span>
                        <span className="event-type">{event.type}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
