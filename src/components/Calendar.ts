import type { Event } from '../models/Event.js';
import { EventStorage } from '../services/EventStorage.js';
import {
  getCalendarGrid,
  getMonthName,
  getShortDayName,
  isSameDay
} from '../utils/dateUtils.js';

/**
 * Calendar component for displaying and managing events
 * Provides a monthly calendar view with event display and interaction
 */
export class Calendar {
  private container: HTMLElement;
  private currentDate: Date;
  private selectedDate: Date | null = null;
  private events: Event[] = [];
  private onDateSelect?: (date: Date) => void;
  private onEventClick?: (event: Event) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.currentDate = new Date();
    this.selectedDate = new Date(); // Start with today selected
    this.init();
  }

  /**
   * Initialize the calendar component
   */
  private async init(): Promise<void> {
    await this.loadEvents();
    this.render();
  }

  /**
   * Load events from storage
   */
  private async loadEvents(): Promise<void> {
    try {
      this.events = await EventStorage.loadAllEvents();
    } catch (error) {
      console.error('Error loading events:', error);
      this.events = [];
    }
  }

  /**
   * Set callback for date selection
   */
  public onDateSelected(callback: (date: Date) => void): void {
    this.onDateSelect = callback;
  }

  /**
   * Set callback for event click
   */
  public onEventClicked(callback: (event: Event) => void): void {
    this.onEventClick = callback;
  }

  /**
   * Refresh the calendar by reloading events and re-rendering
   */
  public async refresh(): Promise<void> {
    await this.loadEvents();
    this.render();
  }

  /**
   * Navigate to the previous month
   */
  private previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.render();
  }

  /**
   * Navigate to the next month
   */
  private nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.render();
  }

  /**
   * Navigate to today
   */
  private goToToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.render();
  }

  /**
   * Handle day click
   */
  private handleDayClick(date: Date): void {
    this.selectedDate = new Date(date);
    this.render();
    
    if (this.onDateSelect) {
      this.onDateSelect(date);
    }
  }

  /**
   * Get events for a specific date
   */
  private getEventsForDate(date: Date): Event[] {
    return this.events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      // Check if the date falls within the event's date range
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      
      return targetDate >= startDate && targetDate <= endDate;
    });
  }

  /**
   * Check if a date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return isSameDay(date, today);
  }

  /**
   * Check if a date is selected
   */
  private isSelected(date: Date): boolean {
    return this.selectedDate ? isSameDay(date, this.selectedDate) : false;
  }

  /**
   * Check if a date is in the current month
   */
  private isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth() && 
           date.getFullYear() === this.currentDate.getFullYear();
  }

  /**
   * Render the calendar
   */
  private render(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const calendarGrid = getCalendarGrid(year, month);
    
    this.container.innerHTML = `
      <div class="calendar">
        <div class="calendar__header">
          <div class="calendar__header-title">
            ${getMonthName(month)} ${year}
          </div>
          <div class="calendar__header-nav">
            <button type="button" id="prev-month">‹ Previous</button>
            <button type="button" id="today">Today</button>
            <button type="button" id="next-month">Next ›</button>
          </div>
        </div>
        
        <div class="calendar__weekdays">
          ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            .map((_, index) => `
              <div class="calendar__weekdays-day">
                ${getShortDayName(index)}
              </div>
            `).join('')}
        </div>
        
        <div class="calendar__grid">
          ${calendarGrid.map(week => 
            week.map(date => this.renderDay(date)).join('')
          ).join('')}
        </div>
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#prev-month')?.addEventListener('click', () => this.previousMonth());
    this.container.querySelector('#next-month')?.addEventListener('click', () => this.nextMonth());
    this.container.querySelector('#today')?.addEventListener('click', () => this.goToToday());

    // Add day click listeners
    this.container.querySelectorAll('.calendar__day').forEach(dayEl => {
      dayEl.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const dateStr = target.dataset.date;
        if (dateStr) {
          const date = new Date(dateStr);
          this.handleDayClick(date);
        }
      });
    });

    // Add event click listeners
    this.container.querySelectorAll('.event-item[data-event-id]').forEach(eventEl => {
      eventEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = (e.currentTarget as HTMLElement).dataset.eventId;
        if (eventId) {
          const event = this.events.find(evt => evt.id === eventId);
          if (event && this.onEventClick) {
            this.onEventClick(event);
          }
        }
      });
    });
  }

  /**
   * Render a single day in the calendar
   */
  private renderDay(date: Date): string {
    const dayEvents = this.getEventsForDate(date);
    const isToday = this.isToday(date);
    const isSelected = this.isSelected(date);
    const isCurrentMonth = this.isCurrentMonth(date);
    const hasEvents = dayEvents.length > 0;

    const classes = [
      'calendar__day',
      isToday ? 'today' : '',
      isSelected ? 'selected' : '',
      !isCurrentMonth ? 'other-month' : '',
      hasEvents ? 'has-events' : ''
    ].filter(Boolean).join(' ');

    return `
      <div class="${classes}" data-date="${date.toISOString()}">
        <div class="calendar__day-number">${date.getDate()}</div>
        <div class="calendar__day-events">
          ${dayEvents.slice(0, 3).map(event => 
            `<div class="event-item priority-${event.priority} category-${event.category}" 
                  data-event-id="${event.id}" 
                  title="${event.title} - ${event.description}">
              ${this.formatEventForDay(event)}
            </div>`
          ).join('')}
          ${dayEvents.length > 3 ? `<div class="event-item more">+${dayEvents.length - 3} more</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Format event text for display in calendar day
   */
  private formatEventForDay(event: Event): string {
    // Always return just the title - details are shown in the sidebar
    return event.title;
  }

  /**
   * Get currently selected date
   */
  public getSelectedDate(): Date | null {
    return this.selectedDate;
  }

  /**
   * Set selected date programmatically
   */
  public setSelectedDate(date: Date): void {
    this.selectedDate = new Date(date);
    this.currentDate = new Date(date);
    this.render();
  }
}
