import React, { useState } from 'react';
import './Schedule.css';
import ScheduleSidebar from './ScheduleSidebar';
import ScheduleCalendar from './ScheduleCalendar';
import EventModal from './EventModal';

const Schedule = () => {
  const [viewType, setViewType] = useState('week');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(2024, 0, 8),
    end: new Date(2024, 0, 14)
  });

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
            <div className="date-range">
              <span>Jan 8, 2024 - Jan 14 2024</span>
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
        />
      </div>
      {selectedEvent && (
        <EventModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Schedule;
