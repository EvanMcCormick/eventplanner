import type { Event, CreateEventData } from '../models/Event.js';

/**
 * Service for managing event storage via backend API (SQL Server)
 * Replaces previous localStorage implementation.
 */
export class EventStorage {
  private static readonly API_BASE = '/api'; // proxied by Vite to our Node API

  /**
   * Load all events for a given venue and date range
   */
  static async loadAllEvents(): Promise<Event[]> {
    // For the calendar, we'll fetch a broad date range (past year to next year)
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() + 1, 11, 31);

    const venueInfo = await this.getVenueInfo();
    const params = new URLSearchParams({
      venueId: venueInfo.venueId,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    const res = await fetch(`${this.API_BASE}/events?${params.toString()}`);
    if (!res.ok) return [];
    const rows = await res.json();

    return rows.map((r: any) => this.mapRowToEvent(r)).sort((a: Event, b: Event) => a.startDate.getTime() - b.startDate.getTime());
  }

  /**
   * Load a single event by ID
   */
  static async loadEvent(id: string): Promise<Event | null> {
    const venueInfo = await this.getVenueInfo();
    const params = new URLSearchParams({
      venueId: venueInfo.venueId,
      start: new Date(2000, 0, 1).toISOString(),
      end: new Date(2100, 11, 31).toISOString(),
    });
    const res = await fetch(`${this.API_BASE}/events?${params.toString()}`);
    if (!res.ok) return null;
    const rows = await res.json();
    const row = rows.find((x: any) => String(x.EventId).toLowerCase() === id.toLowerCase());
    return row ? this.mapRowToEvent(row) : null;
  }

  /**
   * Save a new event
   */
  static async saveEvent(eventData: CreateEventData): Promise<Event> {
    const venueInfo = await this.getVenueInfo();
    const payload = {
      venueId: venueInfo.venueId,
      title: eventData.title,
      description: eventData.description,
      startDate: eventData.startDate.toISOString(),
      endDate: eventData.endDate.toISOString(),
      locationText: eventData.location || null,
      categoryCode: eventData.category,
      priorityCode: eventData.priority,
      isAllDay: 0,
      attendees: eventData.attendees || [],
    };

    const res = await fetch(`${this.API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to save event');
    const { eventId } = await res.json();
    return { id: eventId, ...eventData, createdAt: new Date(), updatedAt: new Date() } as Event;
  }

  /**
   * Update an existing event
   */
  static async updateEvent(event: Event): Promise<Event> {
    const venueInfo = await this.getVenueInfo();
    const payload = {
      eventId: event.id,
      venueId: venueInfo.venueId,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      locationText: event.location || null,
      categoryCode: event.category,
      priorityCode: event.priority,
      isAllDay: 0,
      attendees: event.attendees || [],
    };

    const res = await fetch(`${this.API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to update event');
    return { ...event, updatedAt: new Date() };
  }

  /**
   * Delete an event
   */
  static async deleteEvent(id: string): Promise<boolean> {
    const venueInfo = await this.getVenueInfo();
    const params = new URLSearchParams({ venueId: venueInfo.venueId });
    const res = await fetch(`${this.API_BASE}/events/${encodeURIComponent(id)}?${params.toString()}`, { method: 'DELETE' });
    return res.ok;
  }

  /**
   * Get events for a specific date
   */
  static async getEventsForDate(date: Date): Promise<Event[]> {
    const d0 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    const venueInfo = await this.getVenueInfo();
    const params = new URLSearchParams({
      venueId: venueInfo.venueId,
      start: d0.toISOString(),
      end: d1.toISOString(),
    });

    const res = await fetch(`${this.API_BASE}/events?${params.toString()}`);
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map((r: any) => this.mapRowToEvent(r));
  }

  /**
   * Clear all events (testing)
   */
  static async clearAllEvents(): Promise<boolean> {
    // Not implemented server-side; return true to avoid UI errors
    return true;
  }

  // --- Helpers ---
  private static async getVenueInfo(): Promise<{ venueId: string; venueCode: string }>
  {
    // For now, use DEMO code via existing endpoint through Node script (test-remote-sql shows it works)
    const res = await fetch(`${this.API_BASE}/config/DEMO`);
    if (!res.ok) throw new Error('Failed to load venue configuration');
    const cfg = await res.json();
    return { venueId: cfg.VenueId || cfg.venueId, venueCode: cfg.VenueCode || cfg.venueCode };
  }

  private static mapRowToEvent(r: any): Event {
    return {
      id: String(r.EventId || r.eventId),
      title: r.Title || r.title,
      description: r.Description || r.description || '',
      startDate: new Date(r.StartDate || r.startDate),
      endDate: new Date(r.EndDate || r.endDate),
      location: r.LocationText || r.locationText || undefined,
      category: r.CategoryCode || r.categoryCode,
      priority: r.PriorityCode || r.priorityCode,
      attendees: [],
      createdAt: new Date(r.CreatedAt || r.createdAt || r.StartDate || new Date()),
      updatedAt: new Date(r.UpdatedAt || r.updatedAt || new Date()),
    } as Event;
  }
}
