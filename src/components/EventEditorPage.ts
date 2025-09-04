import type { Event, CreateEventData } from '../models/Event.js';
import { ConfigService } from '../services/ConfigService.js';

/**
 * Dedicated Event Editor page component
 * Provides a full-page interface for creating and editing events with room for expansion
 */
export class EventEditorPage {
  private container: HTMLElement;
  private configService: ConfigService;
  private currentEvent: Event | null = null;
  private initialDate: Date | null = null;
  private onSave?: (eventData: CreateEventData) => Promise<void>;
  private onUpdate?: (event: Event) => Promise<void>;
  private onDelete?: (eventId: string) => Promise<void>;
  private onCancel?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.configService = ConfigService.getInstance();
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
   * Show page for creating a new event
   */
  public showCreatePage(initialDate?: Date): void {
    this.currentEvent = null;
    this.initialDate = initialDate || null;
    this.render();
    this.setupEventListeners();
    this.populateInitialData();
    this.focusFirstInput();
  }

  /**
   * Show page for editing an existing event
   */
  public showEditPage(event: Event): void {
    this.currentEvent = event;
    this.initialDate = null;
    this.render();
    this.setupEventListeners();
    this.populateForm(event);
    this.focusFirstInput();
  }

  /**
   * Populate initial data for new events
   */
  private populateInitialData(): void {
    if (this.initialDate) {
      this.setFormDate(this.initialDate);
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
    const form = this.container.querySelector('#event-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // Cancel button
    const cancelBtn = this.container.querySelector('#cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel());
    }
    
    // Delete button
    const deleteBtn = this.container.querySelector('#delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDelete());
    }

    // Location dropdown handler
    const locationSelect = this.container.querySelector('#event-location');
    const locationCustomInput = this.container.querySelector('#event-location-custom');
    if (locationSelect && locationSelect.tagName === 'SELECT' && locationCustomInput) {
      locationSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        if (target.value === 'custom') {
          (locationCustomInput as HTMLElement).style.display = 'block';
          (locationCustomInput as HTMLInputElement).focus();
        } else {
          (locationCustomInput as HTMLElement).style.display = 'none';
          (locationCustomInput as HTMLInputElement).value = '';
        }
      });
    }

    // Escape key to cancel
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.handleCancel();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
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
      
      this.handleCancel(); // Go back to dashboard
    } catch (error) {
      console.error('Error saving event:', error);
      this.showError('Error saving event. Please try again.');
    }
  }

  /**
   * Handle cancel action
   */
  private handleCancel(): void {
    if (this.onCancel) {
      this.onCancel();
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
        this.handleCancel(); // Go back to dashboard
      } catch (error) {
        console.error('Error deleting event:', error);
        this.showError('Error deleting event. Please try again.');
      }
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    // For now, use alert. Later we can implement a toast notification system
    alert(message);
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
    const locationInput = this.container.querySelector('#event-location') as HTMLSelectElement | HTMLInputElement;
    const locationCustomInput = this.container.querySelector('#event-location-custom') as HTMLInputElement;
    const categorySelect = this.container.querySelector('#event-category') as HTMLSelectElement;
    const prioritySelect = this.container.querySelector('#event-priority') as HTMLSelectElement;
    const attendeesInput = this.container.querySelector('#event-attendees') as HTMLTextAreaElement;

    // Basic validation
    if (!titleInput.value.trim()) {
      this.showError('Please enter an event title.');
      titleInput.focus();
      return null;
    }

    if (!startDateInput.value || !endDateInput.value) {
      this.showError('Please select start and end dates.');
      return null;
    }

    // Combine date and time
    const startDateTime = new Date(`${startDateInput.value}T${startTimeInput.value || '00:00'}`);
    const endDateTime = new Date(`${endDateInput.value}T${endTimeInput.value || '23:59'}`);

    if (startDateTime >= endDateTime) {
      this.showError('End date and time must be after start date and time.');
      return null;
    }

    // Parse attendees
    const attendees = attendeesInput.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // Handle location - could be dropdown or custom input
    let locationValue = '';
    if (locationInput.tagName === 'SELECT') {
      const selectElement = locationInput as HTMLSelectElement;
      if (selectElement.value === 'custom') {
        locationValue = locationCustomInput?.value.trim() || '';
      } else {
        // Find the location name from configuration
        const locations = this.configService.getActiveLocations();
        const selectedLocation = locations.find(loc => loc.id === selectElement.value);
        locationValue = selectedLocation?.name || selectElement.value;
      }
    } else {
      locationValue = locationInput.value.trim();
    }

    return {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      startDate: startDateTime,
      endDate: endDateTime,
      location: locationValue || undefined,
      category: categorySelect.value as any,
      priority: prioritySelect.value as any,
      attendees: attendees.length > 0 ? attendees : undefined
    };
  }

  /**
   * Render the event editor page
   */
  private render(): void {
    const isEditing = this.currentEvent !== null;

    this.container.innerHTML = `
      <div class="event-editor-page">
        <div class="event-editor-header">
          <div class="container">
            <div class="header-content">
              <div class="header-left">
                <button type="button" id="cancel-btn" class="btn btn-ghost">
                  <span>←</span>
                  Back to Calendar
                </button>
              </div>
              <div class="header-center">
                <h1>${isEditing ? 'Edit Event' : 'Create New Event'}</h1>
              </div>
              <div class="header-right">
                ${isEditing ? '<button type="button" id="delete-btn" class="btn btn-danger">Delete Event</button>' : ''}
              </div>
            </div>
          </div>
        </div>

        <div class="event-editor-content">
          <div class="container">
            <form id="event-form" class="event-form">
              <div class="form-section">
                <h2>Basic Information</h2>
                
                <div class="form-group">
                  <label for="event-title">Event Title *</label>
                  <input type="text" id="event-title" required maxlength="100" placeholder="Enter event title">
                </div>
                
                <div class="form-group">
                  <label for="event-description">Description</label>
                  <textarea id="event-description" rows="4" placeholder="Enter event description"></textarea>
                </div>
              </div>

              <div class="form-section">
                <h2>Date & Time</h2>
                
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
              </div>

              <div class="form-section">
                <h2>Details</h2>
                
                <div class="form-group">
                  <label for="event-location">Location</label>
                  ${this.generateLocationOptions()}
                </div>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="event-category">Category</label>
                    <select id="event-category">
                      ${this.generateCategoryOptions()}
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="event-priority">Priority</label>
                    <select id="event-priority">
                      ${this.generatePriorityOptions()}
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="event-attendees">Attendees</label>
                  <textarea id="event-attendees" rows="4" placeholder="Enter attendee names, one per line"></textarea>
                  <small class="form-help">Add one attendee per line</small>
                </div>
              </div>
              
              <div class="form-actions">
                <button type="button" id="cancel-btn-bottom" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary btn-large">
                  ${isEditing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Add event listener for bottom cancel button
    const bottomCancelBtn = this.container.querySelector('#cancel-btn-bottom');
    if (bottomCancelBtn) {
      bottomCancelBtn.addEventListener('click', () => this.handleCancel());
    }
  }

  /**
   * Generate location dropdown options from configuration
   */
  private generateLocationOptions(): string {
    const config = this.configService.getConfig();
    const locations = this.configService.getActiveLocations();
    
    // If locations feature is disabled, return text input
    if (!config.features.showLocation) {
      return '';
    }

    if (locations.length === 0) {
      return '<input type="text" id="event-location" placeholder="Enter event location">';
    }

    const options = locations.map(location => 
      `<option value="${location.id}">${location.name}${location.capacity ? ` (Capacity: ${location.capacity})` : ''}</option>`
    ).join('');

    return `
      <select id="event-location">
        <option value="">Select a location...</option>
        ${options}
        <option value="custom">Other (specify below)</option>
      </select>
      <input type="text" id="event-location-custom" placeholder="Enter custom location" style="display: none; margin-top: 0.5rem;">
    `;
  }

  /**
   * Generate category dropdown options from configuration
   */
  private generateCategoryOptions(): string {
    const categories = this.configService.getAllCategories();
    
    return categories.map(category => 
      `<option value="${category.id}">${category.name}</option>`
    ).join('');
  }

  /**
   * Generate priority dropdown options from configuration
   */
  private generatePriorityOptions(): string {
    const priorities = this.configService.getAllPriorities();
    
    return priorities.map(priority => 
      `<option value="${priority.id}">${priority.name}</option>`
    ).join('');
  }
}
