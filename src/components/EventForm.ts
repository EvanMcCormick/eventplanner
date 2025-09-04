import type { Event, CreateEventData } from '../models/Event.js';
import { EventCategory, Priority } from '../models/Event.js';

/**
 * Event form component for creating and editing events
 * Provides a modal form interface for event management
 */
export class EventForm {
  private container: HTMLElement;
  private isVisible: boolean = false;
  private currentEvent: Event | null = null;
  private onSave?: (eventData: CreateEventData) => Promise<void>;
  private onUpdate?: (event: Event) => Promise<void>;
  private onDelete?: (eventId: string) => Promise<void>;
  private onCancel?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  /**
   * Initialize the form component
   */
  private init(): void {
    this.render();
    this.setupEventListeners();
  }

  /**
   * Set callback for save operation
   */
  public onEventSave(callback: (eventData: CreateEventData) => Promise<void>): void {
    this.onSave = callback;
  }

  /**
   * Set callback for update operation
   */
  public onEventUpdate(callback: (event: Event) => Promise<void>): void {
    this.onUpdate = callback;
  }

  /**
   * Set callback for delete operation
   */
  public onEventDelete(callback: (eventId: string) => Promise<void>): void {
    this.onDelete = callback;
  }

  /**
   * Set callback for cancel operation
   */
  public onFormCancel(callback: () => void): void {
    this.onCancel = callback;
  }

  /**
   * Show form for creating a new event
   */
  public showCreateForm(initialDate?: Date): void {
    this.currentEvent = null;
    this.isVisible = true;
    this.render();
    
    if (initialDate) {
      this.setFormDate(initialDate);
    }
    
    this.focusFirstInput();
  }

  /**
   * Show form for editing an existing event
   */
  public showEditForm(event: Event): void {
    this.currentEvent = event;
    this.isVisible = true;
    this.render();
    this.populateForm(event);
    this.focusFirstInput();
  }

  /**
   * Hide the form
   */
  public hide(): void {
    this.isVisible = false;
    this.render();
    
    if (this.onCancel) {
      this.onCancel();
    }
  }

  /**
   * Set form date (for new events)
   */
  private setFormDate(date: Date): void {
    const startInput = this.container.querySelector('#event-start-date') as HTMLInputElement;
    const endInput = this.container.querySelector('#event-end-date') as HTMLInputElement;
    
    if (startInput && endInput) {
      const dateStr = date.toISOString().split('T')[0];
      startInput.value = dateStr;
      endInput.value = dateStr;
    }
  }

  /**
   * Populate form with event data
   */
  private populateForm(event: Event): void {
    const titleInput = this.container.querySelector('#event-title') as HTMLInputElement;
    const descriptionInput = this.container.querySelector('#event-description') as HTMLTextAreaElement;
    const startDateInput = this.container.querySelector('#event-start-date') as HTMLInputElement;
    const startTimeInput = this.container.querySelector('#event-start-time') as HTMLInputElement;
    const endDateInput = this.container.querySelector('#event-end-date') as HTMLInputElement;
    const endTimeInput = this.container.querySelector('#event-end-time') as HTMLInputElement;
    const locationInput = this.container.querySelector('#event-location') as HTMLInputElement;
    const categorySelect = this.container.querySelector('#event-category') as HTMLSelectElement;
    const prioritySelect = this.container.querySelector('#event-priority') as HTMLSelectElement;
    const attendeesInput = this.container.querySelector('#event-attendees') as HTMLTextAreaElement;

    if (titleInput) titleInput.value = event.title;
    if (descriptionInput) descriptionInput.value = event.description;
    if (locationInput) locationInput.value = event.location || '';
    if (categorySelect) categorySelect.value = event.category;
    if (prioritySelect) prioritySelect.value = event.priority;
    if (attendeesInput) attendeesInput.value = event.attendees?.join('\n') || '';

    // Handle date and time separately
    if (startDateInput && startTimeInput) {
      const startDate = new Date(event.startDate);
      startDateInput.value = startDate.toISOString().split('T')[0];
      startTimeInput.value = startDate.toTimeString().slice(0, 5);
    }

    if (endDateInput && endTimeInput) {
      const endDate = new Date(event.endDate);
      endDateInput.value = endDate.toISOString().split('T')[0];
      endTimeInput.value = endDate.toTimeString().slice(0, 5);
    }
  }

  /**
   * Focus the first input field
   */
  private focusFirstInput(): void {
    setTimeout(() => {
      const firstInput = this.container.querySelector('#event-title') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Form submission
    this.container.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Cancel and close buttons
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.id === 'cancel-btn' || target.classList.contains('modal-overlay')) {
        this.hide();
      }
      
      if (target.id === 'delete-btn') {
        this.handleDelete();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Handle form submission
   */
  private async handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    
    const formData = this.collectFormData();
    if (!formData) {
      return;
    }

    try {
      if (this.currentEvent) {
        // Update existing event
        const updatedEvent: Event = {
          ...this.currentEvent,
          ...formData,
          updatedAt: new Date()
        };
        
        if (this.onUpdate) {
          await this.onUpdate(updatedEvent);
        }
      } else {
        // Create new event
        if (this.onSave) {
          await this.onSave(formData);
        }
      }
      
      this.hide();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    }
  }

  /**
   * Handle event deletion
   */
  private async handleDelete(): Promise<void> {
    if (!this.currentEvent) {
      return;
    }

    if (confirm('Are you sure you want to delete this event?')) {
      try {
        if (this.onDelete) {
          await this.onDelete(this.currentEvent.id);
        }
        this.hide();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
      }
    }
  }

  /**
   * Collect form data and validate
   */
  private collectFormData(): CreateEventData | null {
    const titleInput = this.container.querySelector('#event-title') as HTMLInputElement;
    const descriptionInput = this.container.querySelector('#event-description') as HTMLTextAreaElement;
    const startDateInput = this.container.querySelector('#event-start-date') as HTMLInputElement;
    const startTimeInput = this.container.querySelector('#event-start-time') as HTMLInputElement;
    const endDateInput = this.container.querySelector('#event-end-date') as HTMLInputElement;
    const endTimeInput = this.container.querySelector('#event-end-time') as HTMLInputElement;
    const locationInput = this.container.querySelector('#event-location') as HTMLInputElement;
    const categorySelect = this.container.querySelector('#event-category') as HTMLSelectElement;
    const prioritySelect = this.container.querySelector('#event-priority') as HTMLSelectElement;
    const attendeesInput = this.container.querySelector('#event-attendees') as HTMLTextAreaElement;

    // Basic validation
    if (!titleInput.value.trim()) {
      alert('Please enter an event title.');
      titleInput.focus();
      return null;
    }

    if (!startDateInput.value || !endDateInput.value) {
      alert('Please select start and end dates.');
      return null;
    }

    // Combine date and time
    const startDateTime = new Date(`${startDateInput.value}T${startTimeInput.value || '00:00'}`);
    const endDateTime = new Date(`${endDateInput.value}T${endTimeInput.value || '23:59'}`);

    if (startDateTime >= endDateTime) {
      alert('End date and time must be after start date and time.');
      return null;
    }

    // Parse attendees
    const attendees = attendeesInput.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      startDate: startDateTime,
      endDate: endDateTime,
      location: locationInput.value.trim() || undefined,
      category: categorySelect.value as typeof EventCategory[keyof typeof EventCategory],
      priority: prioritySelect.value as typeof Priority[keyof typeof Priority],
      attendees: attendees.length > 0 ? attendees : undefined
    };
  }

  /**
   * Render the form
   */
  private render(): void {
    if (!this.isVisible) {
      this.container.innerHTML = '';
      return;
    }

    const isEditing = this.currentEvent !== null;

    this.container.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${isEditing ? 'Edit Event' : 'Create New Event'}</h2>
          </div>
          
          <form class="event-form">
            <div class="form-group">
              <label for="event-title">Title *</label>
              <input type="text" id="event-title" required maxlength="100" placeholder="Enter event title">
            </div>
            
            <div class="form-group">
              <label for="event-description">Description</label>
              <textarea id="event-description" rows="3" placeholder="Enter event description"></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="event-start-date">Start Date *</label>
                <input type="date" id="event-start-date" required>
              </div>
              <div class="form-group">
                <label for="event-start-time">Start Time</label>
                <input type="time" id="event-start-time">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="event-end-date">End Date *</label>
                <input type="date" id="event-end-date" required>
              </div>
              <div class="form-group">
                <label for="event-end-time">End Time</label>
                <input type="time" id="event-end-time">
              </div>
            </div>
            
            <div class="form-group">
              <label for="event-location">Location</label>
              <input type="text" id="event-location" placeholder="Enter event location">
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="event-category">Category</label>
                <select id="event-category">
                  <option value="${EventCategory.MEETING}">Meeting</option>
                  <option value="${EventCategory.PERSONAL}">Personal</option>
                  <option value="${EventCategory.WORK}">Work</option>
                  <option value="${EventCategory.SOCIAL}">Social</option>
                  <option value="${EventCategory.HOLIDAY}">Holiday</option>
                  <option value="${EventCategory.APPOINTMENT}">Appointment</option>
                  <option value="${EventCategory.OTHER}">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label for="event-priority">Priority</label>
                <select id="event-priority">
                  <option value="${Priority.LOW}">Low</option>
                  <option value="${Priority.MEDIUM}">Medium</option>
                  <option value="${Priority.HIGH}">High</option>
                  <option value="${Priority.URGENT}">Urgent</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="event-attendees">Attendees (one per line)</label>
              <textarea id="event-attendees" rows="3" placeholder="Enter attendee names, one per line"></textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" id="cancel-btn" class="btn btn-secondary">Cancel</button>
              ${isEditing ? '<button type="button" id="delete-btn" class="btn btn-danger">Delete</button>' : ''}
              <button type="submit" class="btn btn-primary">${isEditing ? 'Update' : 'Create'} Event</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
}
