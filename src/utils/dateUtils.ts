/**
 * Utility functions for working with dates
 * These functions help with formatting and manipulating dates for the calendar
 */

/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date and time to a readable string
 * @param date The date and time to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a time to a readable string
 * @param date The date/time to extract time from
 * @returns Formatted time string
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if two dates are on the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns True if dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get the start of the week for a given date (Sunday)
 * @param date The date to get the week start for
 * @returns Date representing the start of the week
 */
export function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
}

/**
 * Get all days in a month
 * @param year The year
 * @param month The month (0-based, so January = 0)
 * @returns Array of Date objects for each day in the month
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

/**
 * Get the calendar grid for a month (including previous/next month days)
 * @param year The year
 * @param month The month (0-based)
 * @returns 2D array representing the calendar grid (weeks x days)
 */
export function getCalendarGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  
  // Go back to the first Sunday of the calendar grid
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days = 42 days
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    currentWeek.push(currentDate);
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return weeks;
}

/**
 * Get month name
 * @param month Month number (0-based)
 * @returns Month name string
 */
export function getMonthName(month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
}

/**
 * Get day name
 * @param day Day number (0 = Sunday)
 * @returns Day name string
 */
export function getDayName(day: number): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[day];
}

/**
 * Get short day name
 * @param day Day number (0 = Sunday)
 * @returns Short day name string
 */
export function getShortDayName(day: number): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[day];
}
