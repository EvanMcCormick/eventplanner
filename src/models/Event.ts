/**
 * Event model representing a single event in our planner
 * This defines the structure of an event with all necessary properties
 */
export interface Event {
  id: string;              // Unique identifier for the event
  title: string;           // Event title/name
  description: string;     // Detailed description of the event
  startDate: Date;         // When the event starts
  endDate: Date;           // When the event ends
  location?: string;       // Optional location for the event
  category: EventCategory; // Type/category of the event
  priority: Priority;      // How important this event is
  attendees?: string[];    // List of people attending (optional)
  createdAt: Date;         // When this event was created
  updatedAt: Date;         // When this event was last modified
}

/**
 * Different categories/types of events
 */
export const EventCategory = {
  MEETING: 'meeting',
  PERSONAL: 'personal',
  WORK: 'work',
  SOCIAL: 'social',
  HOLIDAY: 'holiday',
  APPOINTMENT: 'appointment',
  OTHER: 'other'
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];

/**
 * Priority levels for events
 */
export const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

/**
 * Interface for creating a new event (some fields are optional during creation)
 */
export interface CreateEventData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  category: EventCategory;
  priority: Priority;
  attendees?: string[];
}
