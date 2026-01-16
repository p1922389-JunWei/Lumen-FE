import React from 'react';
import './ScheduleCalendar.css';

const ScheduleCalendar = ({ events = [], onEventClick = () => {}, viewType = 'week', currentDate = new Date() }) => {
  const timeSlots = [
    '8 AM',
    '9 AM',
    '10 AM',
    '11 AM',
    'Noon',
    '1 PM',
    '2 PM',
    '3 PM',
    '4 PM',
    '5 PM',
  ];

  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const getWeekDays = () => {
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(currentDate);
    monday.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        label: dayLabels[date.getDay()],
        date: date.getDate(),
        fullDate: date,
        month: date.getMonth(),
        year: date.getFullYear()
      });
    }
    return days;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
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

  const getEventsForDate = (fullDate) => {
    return events.filter(event => {
      // Match by full date if event has fullDate
      if (event.fullDate) {
        const eventDate = new Date(event.fullDate);
        return eventDate.toDateString() === fullDate.toDateString();
      }
      // Fallback for events with just date number (legacy support)
      return event.date === fullDate.getDate() && 
             fullDate.getMonth() === 0 && 
             fullDate.getFullYear() === 2026;
    });
  };

  const isToday = (fullDate) => {
    const today = new Date();
    return fullDate.toDateString() === today.toDateString();
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
              className={`month-day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.fullDate) ? 'today' : ''}`}
            >
              <div className="month-day-number">{day.date}</div>
              <div className="month-day-events">
                {getEventsForDate(day.fullDate).slice(0, 3).map(event => (
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
                {getEventsForDate(day.fullDate).length > 3 && (
                  <div className="month-event-more">
                    +{getEventsForDate(day.fullDate).length - 3} more
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
            <div className={`day-date ${isToday(day.fullDate) ? 'today' : ''}`}>{day.date}</div>
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {timeSlots.map((time, timeIdx) => (
          <div key={timeIdx} className="time-row">
            <div className="time-slot">{time}</div>
            {days.map((day, dayIdx) => {
              const dayEvents = getEventsForDate(day.fullDate);
              // Show events that match this time slot or are close to it
              const eventsForSlot = dayEvents.filter(event => {
                if (!event.fullDate) return false;
                const eventDate = new Date(event.fullDate);
                const eventHour = eventDate.getHours();
                const slotHour = time === 'Noon' ? 12 : parseInt(time);
                const isPM = time.includes('PM');
                const actualHour = isPM && slotHour !== 12 ? slotHour + 12 : (time === 'Noon' ? 12 : slotHour);
                // Show event if it's in this hour or within 1 hour range
                return Math.abs(eventHour - actualHour) <= 1;
              });
              
              return (
                <div key={`${timeIdx}-${dayIdx}`} className="day-slot">
                  {eventsForSlot.map(event => (
                    <div
                      key={event.id}
                      className="event-card"
                      style={{ backgroundColor: getEventColor(event.type) }}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="event-time">{event.time}</div>
                      <div className="event-title">{event.title}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleCalendar;
