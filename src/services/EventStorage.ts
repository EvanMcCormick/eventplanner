import type { Event, CreateEventData } from '../models/Event.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for managing event storage using browser localStorage
 * In a real application, this would typically connect to a backend API
 * For now, we'll simulate file-based storage using localStorage
 */
export class EventStorage {
  private static readonly EVENTS_KEY = 'eventplanner_events';
  private static readonly EVENT_PREFIX = 'event_';

  /**
   * Load all events from storage
   * @returns Promise with array of all events
   */
  static async loadAllEvents(): Promise<Event[]> {
    try {
      const eventsData = localStorage.getItem(this.EVENTS_KEY);
      if (!eventsData) {
        return [];
      }

      const eventIds: string[] = JSON.parse(eventsData);
      const events: Event[] = [];

      // Load each event individually
      for (const eventId of eventIds) {
        const event = await this.loadEvent(eventId);
        if (event) {
          events.push(event);
        }
      }

      return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  }

  /**
   * Load a single event by ID
   * @param id The event ID to load
   * @returns Promise with the event or null if not found
   */
  static async loadEvent(id: string): Promise<Event | null> {
    try {
      const eventData = localStorage.getItem(this.EVENT_PREFIX + id);
      if (!eventData) {
        return null;
      }

      const parsedEvent = JSON.parse(eventData);
      
      // Convert date strings back to Date objects
      return {
        ...parsedEvent,
        startDate: new Date(parsedEvent.startDate),
        endDate: new Date(parsedEvent.endDate),
        createdAt: new Date(parsedEvent.createdAt),
        updatedAt: new Date(parsedEvent.updatedAt)
      };
    } catch (error) {
      console.error(`Error loading event ${id}:`, error);
      return null;
    }
  }

  /**
   * Save a new event
   * @param eventData The event data to save
   * @returns Promise with the created event
   */
  static async saveEvent(eventData: CreateEventData): Promise<Event> {
    const now = new Date();
    const event: Event = {
      id: uuidv4(),
      ...eventData,
      createdAt: now,
      updatedAt: now
    };

    await this.updateEvent(event);
    return event;
  }

  /**
   * Update an existing event
   * @param event The event to update
   * @returns Promise with the updated event
   */
  static async updateEvent(event: Event): Promise<Event> {
    try {
      const updatedEvent = {
        ...event,
        updatedAt: new Date()
      };

      // Save the individual event
      localStorage.setItem(
        this.EVENT_PREFIX + event.id,
        JSON.stringify(updatedEvent)
      );

      // Update the events list
      await this.updateEventsList(event.id);

      return updatedEvent;
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param id The ID of the event to delete
   * @returns Promise indicating success
   */
  static async deleteEvent(id: string): Promise<boolean> {
    try {
      // Remove the event file
      localStorage.removeItem(this.EVENT_PREFIX + id);

      // Update the events list
      const eventsData = localStorage.getItem(this.EVENTS_KEY);
      if (eventsData) {
        const eventIds: string[] = JSON.parse(eventsData);
        const updatedIds = eventIds.filter(eventId => eventId !== id);
        localStorage.setItem(this.EVENTS_KEY, JSON.stringify(updatedIds));
      }

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  /**
   * Get events for a specific date
   * @param date The date to get events for
   * @returns Promise with array of events on that date
   */
  static async getEventsForDate(date: Date): Promise<Event[]> {
    const allEvents = await this.loadAllEvents();
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return allEvents.filter(event => {
      const eventStartDate = new Date(
        event.startDate.getFullYear(),
        event.startDate.getMonth(),
        event.startDate.getDate()
      );
      const eventEndDate = new Date(
        event.endDate.getFullYear(),
        event.endDate.getMonth(),
        event.endDate.getDate()
      );

      return targetDate >= eventStartDate && targetDate <= eventEndDate;
    });
  }

  /**
   * Update the master list of event IDs
   * @param eventId The event ID to add to the list
   */
  private static async updateEventsList(eventId: string): Promise<void> {
    const eventsData = localStorage.getItem(this.EVENTS_KEY);
    let eventIds: string[] = eventsData ? JSON.parse(eventsData) : [];

    if (!eventIds.includes(eventId)) {
      eventIds.push(eventId);
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(eventIds));
    }
  }

  /**
   * Clear all events (useful for testing or reset)
   * @returns Promise indicating success
   */
  static async clearAllEvents(): Promise<boolean> {
    try {
      const eventsData = localStorage.getItem(this.EVENTS_KEY);
      if (eventsData) {
        const eventIds: string[] = JSON.parse(eventsData);
        
        // Remove all individual event files
        for (const eventId of eventIds) {
          localStorage.removeItem(this.EVENT_PREFIX + eventId);
        }
      }

      // Clear the events list
      localStorage.removeItem(this.EVENTS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing events:', error);
      return false;
    }
  }
}
