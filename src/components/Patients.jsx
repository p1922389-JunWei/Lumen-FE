import React from 'react';
import ScheduleSidebar from './ScheduleSidebar';
import './Pages.css';

const Patients = () => {
  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="schedule-main">
        <div className="schedule-header">
          <h1>Patients</h1>
        </div>
        <div className="page-content">
          <p>Patients management page</p>
        </div>
      </div>
    </div>
  );
};

export default Patients;
