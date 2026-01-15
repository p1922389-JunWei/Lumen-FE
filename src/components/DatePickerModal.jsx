import React, { useState } from 'react';
import './DatePickerModal.css';

const DatePickerModal = ({ currentDate, onSelect, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years from 2020 to 2030
  const years = [];
  for (let year = 2020; year <= 2030; year++) {
    years.push(year);
  }

  const handleApply = () => {
    const newDate = new Date(selectedYear, selectedMonth, 1);
    onSelect(newDate);
  };

  return (
    <div className="datepicker-overlay" onClick={onClose}>
      <div className="datepicker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="datepicker-header">
          <h3>Select Date</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="datepicker-body">
          <div className="datepicker-row">
            <label>Month</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
          </div>

          <div className="datepicker-row">
            <label>Year</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="datepicker-footer">
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn btn-apply" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
