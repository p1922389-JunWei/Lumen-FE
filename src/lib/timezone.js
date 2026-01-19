// Timezone utility functions for GMT+8 (Singapore timezone)

const TIMEZONE = 'Asia/Singapore';

/**
 * Format a date to local datetime-local input format (YYYY-MM-DDTHH:mm)
 * This is used for input[type="datetime-local"] value
 */
export const formatToDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  // Format in Singapore timezone
  const options = {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
  const values = {};
  parts.forEach(part => {
    values[part.type] = part.value;
  });
  
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
};

/**
 * Format a date for display (e.g., "Jan 20, 2026, 2:29 AM")
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  const defaultOptions = {
    timeZone: TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options
  };
  
  return date.toLocaleString('en-US', defaultOptions);
};

/**
 * Format time only (e.g., "2:29 AM")
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  return date.toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date only (e.g., "Jan 20, 2026")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date for short display (e.g., "Mon, Jan 20")
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  return date.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get time range string (e.g., "2:29 AM - 3:29 AM")
 */
export const formatTimeRange = (startTime, endTime) => {
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  return `${start} - ${end}`;
};

/**
 * Calculate duration between two dates
 */
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (hours === 0) {
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Check if date is today (in Singapore timezone)
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  
  const dateStr = date.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  const todayStr = today.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  
  return dateStr === todayStr;
};

/**
 * Check if date is tomorrow (in Singapore timezone)
 */
export const isTomorrow = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateStr = date.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  
  return dateStr === tomorrowStr;
};

/**
 * Get relative date label (Today, Tomorrow, or formatted date)
 */
export const getRelativeDateLabel = (dateString) => {
  if (isToday(dateString)) return 'Today';
  if (isTomorrow(dateString)) return 'Tomorrow';
  return formatDateShort(dateString);
};

/**
 * Convert datetime-local input value to ISO string for API submission
 * The input is in local time, we need to send it properly
 */
export const dateTimeLocalToISO = (dateTimeLocalValue) => {
  if (!dateTimeLocalValue) return null;
  // The datetime-local value is already in local time, create a date and convert to ISO
  const date = new Date(dateTimeLocalValue);
  return date.toISOString();
};

export default {
  formatToDateTimeLocal,
  formatDateTime,
  formatTime,
  formatDate,
  formatDateShort,
  formatTimeRange,
  calculateDuration,
  isToday,
  isTomorrow,
  getRelativeDateLabel,
  dateTimeLocalToISO
};
