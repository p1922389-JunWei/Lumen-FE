import React from 'react';
import { Accessibility } from 'lucide-react';
import './EventModal.css';

const EventModal = ({ event, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{event.title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="event-time-section">
            <div className="time-display">
              <span className="time">{event.time}</span>
              <span className="duration">{event.duration}</span>
            </div>
          </div>

          {event.location && (
            <div className="section">
              <h4>📍 Location</h4>
              <p className="section-text">{event.location}</p>
            </div>
          )}

          {event.description && (
            <div className="section">
              <h4>Description</h4>
              <p className="section-text">{event.description}</p>
            </div>
          )}

          {event.disabled_friendly && (
            <div className="section">
              <div className="badge" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                <Accessibility size={16} />
                <span>Disabled Friendly</span>
              </div>
            </div>
          )}

          {event.notes && (
            <div className="section">
              <h4>Additional Information</h4>
              <p>{event.notes}</p>
            </div>
          )}

          {event.files && event.files.length > 0 && (
            <div className="section">
              <h4>Files</h4>
              <div className="files-list">
                {event.files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <span className="file-icon">📄</span>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-date">{file.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-cancel">Cancel</button>
          <button className="btn btn-reschedule">Reschedule</button>
          <button className="btn btn-start">Start Session</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
