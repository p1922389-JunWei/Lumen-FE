import React, { useState } from 'react';
import './Schedule.css';
import ScheduleSidebar from './ScheduleSidebar';
import ScheduleCalendar from './ScheduleCalendar';
import EventModal from './EventModal';
import DatePickerModal from './DatePickerModal';

const Schedule = () => {
  const [viewType, setViewType] = useState('week');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 14)); // Jan 14, 2026
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    setCurrentDate(new Date(2026, 0, 14)); // Reset to Jan 14, 2026
  };

  const events = [
    {
      id: 1,
      title: 'Chance Ekstr Boithman',
      time: '9:00 AM',
      duration: '1 hour',
      type: 'Video Call',
      day: 'MON',
      date: 8,
      description: 'Complaint of abdominal pain after eating',
      notes: 'Patient reports post-meal abdominal pain. Pain characteristics, diet history, and recent dietary changes to be evaluated.',
      files: [{ name: 'Blood Test Report.pdf', date: '10 Aug 2023' }],
      inPerson: false
    },
    {
      id: 2,
      title: 'Ahmad Kante',
      time: '10:35 AM',
      duration: '30 min',
      type: 'Audio Call',
      day: 'MON',
      date: 8,
      description: 'Follow-up consultation'
    },
    {
      id: 3,
      title: 'Miracle Workman',
      time: '8:00 AM',
      duration: '1 hour',
      type: 'Home Visit',
      day: 'TUE',
      date: 9,
      description: 'Home visit'
    },
    {
      id: 4,
      title: 'Zaire Vill',
      time: '8:30 AM',
      duration: '1 hour',
      type: 'Meeting',
      day: 'WED',
      date: 10,
      location: 'Hospital'
    },
    {
      id: 5,
      title: 'Kadin Geidt',
      time: '9:00 AM',
      duration: '1 hour',
      type: 'Video Call',
      day: 'WED',
      date: 10
    },
    {
      id: 6,
      title: 'Pailyn Torff',
      time: '10:30 AM',
      duration: '45 min',
      type: 'Audio Call',
      day: 'WED',
      date: 10
    },
    {
      id: 7,
      title: 'Jaylen Lubin',
      time: '8:00 AM',
      duration: '1 hour',
      type: 'Home Visit',
      day: 'FRI',
      date: 12
    },
    {
      id: 8,
      title: 'Zaine Lubin',
      time: '8:30 AM',
      duration: '1 hour',
      type: 'Home Visit',
      day: 'FRI',
      date: 12
    },
    {
      id: 9,
      title: 'Jaylen Cuthane',
      time: '8:00 AM',
      duration: '1 hour',
      type: 'Video Call',
      day: 'SAT',
      date: 13
    },
    {
      id: 10,
      title: 'Chance Botosh',
      time: '9:00 AM',
      duration: '1 hour',
      type: 'Video Call',
      day: 'SAT',
      date: 13
    }
  ];

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
        <ScheduleCalendar 
          events={events} 
          onEventClick={setSelectedEvent}
          viewType={viewType}
          currentDate={currentDate}
        />
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
