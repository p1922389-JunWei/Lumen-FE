import React from 'react';
import ScheduleSidebar from './ScheduleSidebar';
import './Pages.css';

const Reports = () => {
  return (
    <div className="schedule-container">
      <ScheduleSidebar />
      <div className="schedule-main">
        <div className="schedule-header">
          <h1>Reports</h1>
        </div>
        <div className="page-content">
          <p>Reports and analytics page</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
