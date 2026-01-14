import React from 'react';
import ScheduleSidebar from './ScheduleSidebar';
import './Pages.css';

const Laboratory = () => {
  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="schedule-main">
        <div className="schedule-header">
          <h1>Laboratory</h1>
        </div>
        <div className="page-content">
          <p>Laboratory tests and results page</p>
        </div>
      </div>
    </div>
  );
};

export default Laboratory;
