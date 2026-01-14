import React from 'react';
import ScheduleSidebar from './ScheduleSidebar';
import './Pages.css';

const Programs = () => {
  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="schedule-main">
        <div className="schedule-header">
          <h1>Programs</h1>
        </div>
        <div className="page-content">
          <p>Programs management page</p>
        </div>
      </div>
    </div>
  );
};

export default Programs;
