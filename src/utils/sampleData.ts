import type { CreateEventData } from '../models/Event.js';
import { EventCategory, Priority } from '../models/Event.js';
import { EventStorage } from '../services/EventStorage.js';

/**
 * Creates sample events for testing the application
 * This function can be called to populate the app with example data
 */
export async function createSampleEvents(): Promise<void> {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const sampleEvents: CreateEventData[] = [
    {
      title: 'Team Meeting',
      description: 'Weekly team sync to discuss project progress and upcoming deadlines.',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      location: 'Conference Room A',
      category: EventCategory.MEETING,
      priority: Priority.HIGH,
      attendees: ['John Doe', 'Jane Smith', 'Mike Johnson']
    },
    {
      title: 'Lunch with Sarah',
      description: 'Catch up over lunch at the new Italian restaurant downtown.',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
      location: 'Mario\'s Italian Restaurant',
      category: EventCategory.PERSONAL,
      priority: Priority.MEDIUM,
      attendees: ['Sarah Wilson']
    },
    {
      title: 'Project Deadline',
      description: 'Final submission for the Q4 marketing campaign project.',
      startDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0),
      endDate: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 18, 0),
      category: EventCategory.WORK,
      priority: Priority.URGENT
    },
    {
      title: 'Doctor Appointment',
      description: 'Annual check-up with Dr. Anderson.',
      startDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 10, 30),
      endDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 11, 30),
      location: 'Downtown Medical Center',
      category: EventCategory.APPOINTMENT,
      priority: Priority.HIGH
    },
    {
      title: 'Birthday Party',
      description: 'Celebrating Tom\'s 30th birthday with friends and family.',
      startDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate() + 1, 19, 0),
      endDate: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate() + 1, 23, 0),
      location: 'Tom\'s House',
      category: EventCategory.SOCIAL,
      priority: Priority.MEDIUM,
      attendees: ['Tom Brown', 'Lisa Green', 'David White', 'Amy Black']
    },
    {
      title: 'Conference Call',
      description: 'Q4 strategy discussion with international team.',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 15, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 16, 30),
      category: EventCategory.MEETING,
      priority: Priority.HIGH,
      attendees: ['Remote Team']
    },
    {
      title: 'Gym Session',
      description: 'Personal training session with Mark.',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 18, 0),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 19, 0),
      location: 'FitLife Gym',
      category: EventCategory.PERSONAL,
      priority: Priority.LOW
    }
  ];

  try {
    // Clear existing events first (if any)
    await EventStorage.clearAllEvents();

    // Create sample events
    for (const eventData of sampleEvents) {
      await EventStorage.saveEvent(eventData);
    }

    console.log('Sample events created successfully!');
  } catch (error) {
    console.error('Error creating sample events:', error);
  }
}

/**
 * Utility function to add to window for easy testing
 * Call window.createSampleData() in the browser console to populate with sample data
 */
declare global {
  interface Window {
    createSampleData: () => Promise<void>;
  }
}

// Make function available globally for testing
window.createSampleData = createSampleEvents;
