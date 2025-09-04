import type { Event, CreateEventData } from '../models/Event.js';
import { EventStorage } from '../services/EventStorage.js';
import { ConfigService } from '../services/ConfigService.js';
import { Calendar } from './Calendar.js';
import { EventEditorPage } from './EventEditorPage.js';
import { ConfigPage } from './ConfigPage.js';
import { Router } from '../utils/router.js';
import { formatDate, formatDateTime } from '../utils/dateUtils.js';

/**
 * Main Dashboard component that orchestrates the entire application
 * Now uses router-based navigation between dashboard and event editor pages
 */
export class Dashboard {
  private container: HTMLElement;
  private router: Router;
  private configService: ConfigService;
  private calendar!: Calendar;
  private eventEditor!: EventEditorPage;
  private configPage!: ConfigPage;
  private events: Event[] = [];
  private selectedDate: Date | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.router = new Router();
    this.configService = ConfigService.getInstance();
    this.init();
  }

  /**
   * Initialize the dashboard
   */
  private async init(): Promise<void> {
    await this.loadEvents();
    this.setupRouter();
    this.router.init();
    
    // Start with dashboard page
    this.showDashboardPage();
  }

  /**
   * Setup router navigation
   */
  private setupRouter(): void {
    this.router.onNavigate((page, data) => {
      switch (page) {
        case 'dashboard':
          this.showDashboardPage();
          break;
        case 'create-event':
          this.showCreateEventPage(data?.date);
          break;
        case 'edit-event':
          this.showEditEventPage(data?.event);
          break;
        case 'config':
          this.showConfigPage();
          break;
        default:
          this.showDashboardPage();
      }
    });
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
   * Show the main dashboard page
   */
  private showDashboardPage(): void {
    this.renderDashboard();
    this.setupDashboardComponents();
    this.setupDashboardEventListeners();
    
    // Automatically select today's date to show today's events by default
    this.selectedDate = new Date();
    this.updateEventList();
    
    // Also update the calendar to highlight today
    if (this.calendar) {
      this.calendar.setSelectedDate(new Date());
    }
  }

  /**
   * Show the create event page
   */
  private showCreateEventPage(initialDate?: Date): void {
    this.renderEventEditor();
    this.setupEventEditor();
    this.eventEditor.showCreatePage(initialDate);
  }

  /**
   * Show the edit event page
   */
  private showEditEventPage(event: Event): void {
    this.renderEventEditor();
    this.setupEventEditor();
    this.eventEditor.showEditPage(event);
  }

  /**
   * Show the configuration page
   */
  private showConfigPage(): void {
    this.renderConfigPage();
    this.setupConfigPage();
  }

  /**
   * Setup calendar and dashboard components
   */
  private setupDashboardComponents(): void {
    // Initialize calendar
    const calendarContainer = this.container.querySelector('#calendar-container');
    if (calendarContainer) {
      this.calendar = new Calendar(calendarContainer as HTMLElement);
      
      // Setup calendar callbacks
      this.calendar.onDateSelected((date) => {
        this.selectedDate = date;
        this.updateEventList();
      });

      this.calendar.onEventClicked((event) => {
        this.router.navigateTo('edit-event', { event });
      });
    }
  }

  /**
   * Setup event editor component
   */
  private setupEventEditor(): void {
    const editorContainer = this.container.querySelector('#editor-container');
    if (editorContainer) {
      this.eventEditor = new EventEditorPage(editorContainer as HTMLElement);
      
      // Setup editor callbacks
      this.eventEditor.onEventSave(async (eventData: CreateEventData) => {
        await this.handleCreateEvent(eventData);
      });

      this.eventEditor.onEventUpdate(async (event: Event) => {
        await this.handleUpdateEvent(event);
      });

      this.eventEditor.onEventDelete(async (eventId: string) => {
        await this.handleDeleteEvent(eventId);
      });

      this.eventEditor.onFormCancel(() => {
        this.router.navigateTo('dashboard');
      });
    }
  }

  /**
   * Setup dashboard event listeners
   */
  private setupDashboardEventListeners(): void {
    // New event button
    const newEventBtn = this.container.querySelector('#new-event-btn');
    newEventBtn?.addEventListener('click', () => {
      this.router.navigateTo('create-event', { date: this.selectedDate });
    });

    // Refresh button
    const refreshBtn = this.container.querySelector('#refresh-btn');
    refreshBtn?.addEventListener('click', () => {
      this.refresh();
    });

    // Config button
    const configBtn = this.container.querySelector('#config-btn');
    configBtn?.addEventListener('click', () => {
      this.router.navigateTo('config');
    });
  }

  /**
   * Handle creating a new event
   */
  private async handleCreateEvent(eventData: CreateEventData): Promise<void> {
    try {
      await EventStorage.saveEvent(eventData);
      await this.loadEvents();
      this.router.navigateTo('dashboard');
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Handle updating an existing event
   */
  private async handleUpdateEvent(event: Event): Promise<void> {
    try {
      await EventStorage.updateEvent(event);
      await this.loadEvents();
      this.router.navigateTo('dashboard');
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Handle deleting an event
   */
  private async handleDeleteEvent(eventId: string): Promise<void> {
    try {
      await EventStorage.deleteEvent(eventId);
      await this.loadEvents();
      this.router.navigateTo('dashboard');
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  /**
   * Refresh the dashboard data
   */
  private async refresh(): Promise<void> {
    await this.loadEvents();
    if (this.calendar) {
      await this.calendar.refresh();
    }
    this.updateEventList();
    this.updateStats();
  }

  /**
   * Update the event list for the selected date
   */
  private updateEventList(): void {
    const eventListContainer = this.container.querySelector('#event-list');
    if (!eventListContainer) {
      return;
    }

    const selectedEvents = this.selectedDate 
      ? this.getEventsForDate(this.selectedDate)
      : [];

    const dateDisplay = this.selectedDate 
      ? formatDate(this.selectedDate)
      : 'Select a date';

    if (selectedEvents.length === 0) {
      eventListContainer.innerHTML = `
        <div class="event-list">
          <div class="event-list__header">
            <h3>Events</h3>
            <div class="date-display">${dateDisplay}</div>
          </div>
          <div class="event-list__empty">
            <div class="empty-icon">📅</div>
            <div class="empty-message">No events</div>
            <div class="empty-submessage">
              ${this.selectedDate ? 'No events on this date' : 'Select a date to view events'}
            </div>
          </div>
        </div>
      `;
    } else {
      eventListContainer.innerHTML = `
        <div class="event-list">
          <div class="event-list__header">
            <h3>Events</h3>
            <div class="date-display">${dateDisplay}</div>
          </div>
          <div class="event-list__content">
            ${selectedEvents.map(event => this.renderEventListItem(event)).join('')}
          </div>
        </div>
      `;

      // Add click listeners to event items
      eventListContainer.querySelectorAll('.event-list__item').forEach((item, index) => {
        item.addEventListener('click', () => {
          this.router.navigateTo('edit-event', { event: selectedEvents[index] });
        });
      });
    }
  }

  /**
   * Render a single event in the event list
   */
  private renderEventListItem(event: Event): string {
    const startTime = formatDateTime(new Date(event.startDate));
    const endTime = formatDateTime(new Date(event.endDate));

    return `
      <div class="event-list__item">
        <div class="event-list__item-title">${event.title}</div>
        <div class="event-list__item-time">${startTime} - ${endTime}</div>
        ${event.description ? `<div class="event-list__item-description">${event.description}</div>` : ''}
        <div class="event-list__item-meta">
          <span class="priority priority-${event.priority}">${event.priority}</span>
          <span class="category category-${event.category}">${event.category}</span>
        </div>
        ${event.location ? `<div class="event-list__item-location">${event.location}</div>` : ''}
      </div>
    `;
  }

  /**
   * Get events for a specific date
   */
  private getEventsForDate(date: Date): Event[] {
    return this.events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      
      return targetDate >= startDate && targetDate <= endDate;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  /**
   * Update dashboard statistics
   */
  private updateStats(): void {
    const totalEvents = this.events.length;
    const todayEvents = this.getEventsForDate(new Date()).length;
    const upcomingEvents = this.events.filter(event => {
      const eventDate = new Date(event.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate > today;
    }).length;

    const urgentEvents = this.events.filter(event => 
      event.priority === 'urgent' && new Date(event.startDate) >= new Date()
    ).length;

    const statsContainer = this.container.querySelector('#stats-container');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <div class="quick-stats">
          <div class="stat-card">
            <div class="stat-card__icon">📊</div>
            <div class="stat-card__value">${totalEvents}</div>
            <div class="stat-card__label">Total Events</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">📅</div>
            <div class="stat-card__value">${todayEvents}</div>
            <div class="stat-card__label">Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">⏰</div>
            <div class="stat-card__value">${upcomingEvents}</div>
            <div class="stat-card__label">Upcoming</div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">🚨</div>
            <div class="stat-card__value">${urgentEvents}</div>
            <div class="stat-card__label">Urgent</div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Render the main dashboard layout
   */
  private renderDashboard(): void {
    const config = this.configService.getConfig();
    
    this.container.innerHTML = `
      <div class="dashboard">
        <div class="dashboard__header">
          <div class="container">
            <h1 class="dashboard__header-title">
              <span class="logo">${config.logo}</span>
              ${config.companyName}
              ${config.tagline ? `<small>${config.tagline}</small>` : ''}
            </h1>
            <div class="dashboard__header-actions">
              <button id="new-event-btn" class="btn btn-primary">
                <span>➕</span>
                New Event
              </button>
              <button id="refresh-btn" class="btn btn-secondary">
                <span>🔄</span>
                Refresh
              </button>
              <button id="config-btn" class="btn btn-secondary">
                <span>⚙️</span>
                Settings
              </button>
            </div>
          </div>
        </div>

        <div class="container">
          <div id="stats-container"></div>

          <div class="dashboard__content">
            <div class="dashboard__main">
              <div id="calendar-container"></div>
            </div>
            
            <div class="dashboard__sidebar">
              <div id="event-list"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Update stats after rendering
    this.updateStats();
  }

  /**
   * Render the event editor layout
   */
  private renderEventEditor(): void {
    this.container.innerHTML = `
      <div id="editor-container"></div>
    `;
  }

  /**
   * Render the configuration page layout
   */
  private renderConfigPage(): void {
    this.container.innerHTML = `
      <div id="config-container"></div>
    `;
  }

  /**
   * Setup configuration page component
   */
  private setupConfigPage(): void {
    const configContainer = this.container.querySelector('#config-container');
    if (configContainer) {
      this.configPage = new ConfigPage(configContainer as HTMLElement);
      this.configPage.render();
    }
  }
}
