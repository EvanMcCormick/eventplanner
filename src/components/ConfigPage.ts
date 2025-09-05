import { ConfigService } from '../services/ConfigService.js';
import type { VenueConfig, LocationOption, CategoryOption, PriorityOption } from '../models/VenueConfig.js';

/**
 * Configuration page component for editing venue and application settings
 * Provides a comprehensive interface for customizing the event planner
 */
export class ConfigPage {
  private container: HTMLElement;
  private configService: ConfigService;
  private config!: VenueConfig;

  constructor(container: HTMLElement) {
    this.container = container;
    this.configService = ConfigService.getInstance();
  }

  /**
   * Render the configuration page
   */
  public async render(): Promise<void> {
    this.config = await this.configService.getConfig();
    this.container.innerHTML = `
      <div class="config-page">
        <div class="config-header">
          <h1>⚙️ Configuration Settings</h1>
          <p>Customize your Event Planner to match your venue and preferences</p>
          <div class="config-actions">
            <button class="btn btn-secondary" id="reset-config">Reset to Defaults</button>
            <button class="btn btn-secondary" id="export-config">Export Settings</button>
            <button class="btn btn-secondary" id="import-config">Import Settings</button>
            <input type="file" id="import-file" accept=".json" style="display: none;">
          </div>
        </div>

        <div class="config-content">
          <!-- Branding Section -->
          <div class="config-section">
            <h2>🎨 Branding & Appearance</h2>
            <div class="config-grid">
              <div class="form-group">
                <label for="company-name">Company Name</label>
                <input type="text" id="company-name" value="${this.config.companyName}" maxlength="50">
              </div>
              <div class="form-group">
                <label for="logo">Logo (Emoji or URL)</label>
                <input type="text" id="logo" value="${this.config.logo}" maxlength="100">
              </div>
              <div class="form-group">
                <label for="tagline">Tagline (Optional)</label>
                <input type="text" id="tagline" value="${this.config.tagline || ''}" maxlength="100">
              </div>
              <div class="form-group">
                <label for="primary-color">Primary Color</label>
                <div class="color-input">
                  <input type="color" id="primary-color" value="${this.config.primaryColor}">
                  <input type="text" id="primary-color-text" value="${this.config.primaryColor}" pattern="^#[0-9A-Fa-f]{6}$">
                </div>
              </div>
              <div class="form-group">
                <label for="secondary-color">Secondary Color</label>
                <div class="color-input">
                  <input type="color" id="secondary-color" value="${this.config.secondaryColor}">
                  <input type="text" id="secondary-color-text" value="${this.config.secondaryColor}" pattern="^#[0-9A-Fa-f]{6}$">
                </div>
              </div>
            </div>
          </div>

          <!-- Venue Information Section -->
          <div class="config-section">
            <h2>🏢 Venue Information</h2>
            <div class="config-grid">
              <div class="form-group">
                <label for="venue-name">Venue Name</label>
                <input type="text" id="venue-name" value="${this.config.venueName}" maxlength="100">
              </div>
              <div class="form-group">
                <label for="venue-address">Address (Optional)</label>
                <textarea id="venue-address" rows="2" maxlength="200">${this.config.venueAddress || ''}</textarea>
              </div>
              <div class="form-group">
                <label for="venue-phone">Phone (Optional)</label>
                <input type="tel" id="venue-phone" value="${this.config.venuePhone || ''}" maxlength="20">
              </div>
              <div class="form-group">
                <label for="venue-email">Email (Optional)</label>
                <input type="email" id="venue-email" value="${this.config.venueEmail || ''}" maxlength="100">
              </div>
              <div class="form-group">
                <label for="venue-website">Website (Optional)</label>
                <input type="url" id="venue-website" value="${this.config.venueWebsite || ''}" maxlength="100">
              </div>
            </div>
          </div>

          <!-- Locations Section -->
          <div class="config-section">
            <h2>📍 Locations</h2>
            <p>Manage available locations for events</p>
            <button class="btn btn-primary" id="add-location">+ Add Location</button>
            <div id="locations-list" class="config-list">
              ${this.renderLocationsList()}
            </div>
          </div>

          <!-- Categories Section -->
          <div class="config-section">
            <h2>🏷️ Custom Categories</h2>
            <p>Add custom event categories (in addition to default ones)</p>
            <button class="btn btn-primary" id="add-category">+ Add Category</button>
            <div id="categories-list" class="config-list">
              ${this.renderCategoriesList()}
            </div>
          </div>

          <!-- Priorities Section -->
          <div class="config-section">
            <h2>⚡ Custom Priorities</h2>
            <p>Add custom priority levels (in addition to default ones)</p>
            <button class="btn btn-primary" id="add-priority">+ Add Priority</button>
            <div id="priorities-list" class="config-list">
              ${this.renderPrioritiesList()}
            </div>
          </div>

          <!-- Application Settings Section -->
          <div class="config-section">
            <h2>⚙️ Application Settings</h2>
            <div class="config-grid">
              <div class="form-group">
                <label for="time-format">Time Format</label>
                <select id="time-format">
                  <option value="12h" ${this.config.timeFormat === '12h' ? 'selected' : ''}>12 Hour (AM/PM)</option>
                  <option value="24h" ${this.config.timeFormat === '24h' ? 'selected' : ''}>24 Hour</option>
                </select>
              </div>
              <div class="form-group">
                <label for="date-format">Date Format</label>
                <select id="date-format">
                  <option value="MM/DD/YYYY" ${this.config.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY" ${this.config.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD" ${this.config.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                </select>
              </div>
              <div class="form-group">
                <label for="first-day-week">First Day of Week</label>
                <select id="first-day-week">
                  <option value="0" ${this.config.firstDayOfWeek === 0 ? 'selected' : ''}>Sunday</option>
                  <option value="1" ${this.config.firstDayOfWeek === 1 ? 'selected' : ''}>Monday</option>
                </select>
              </div>
              <div class="form-group">
                <label for="default-duration">Default Event Duration (hours)</label>
                <input type="number" id="default-duration" value="${this.config.defaultEventDuration}" min="0.25" max="24" step="0.25">
              </div>
            </div>
          </div>

          <!-- Feature Flags Section -->
          <div class="config-section">
            <h2>🚀 Features</h2>
            <div class="config-grid">
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="show-attendees" ${this.config.features.showAttendees ? 'checked' : ''}>
                  Show Attendees Field
                </label>
              </div>
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="show-location" ${this.config.features.showLocation ? 'checked' : ''}>
                  Show Location Field
                </label>
              </div>
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="show-description" ${this.config.features.showDescription ? 'checked' : ''}>
                  Show Description Field
                </label>
              </div>
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="allow-recurring" ${this.config.features.allowRecurring ? 'checked' : ''}>
                  Allow Recurring Events (Future Feature)
                </label>
              </div>
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" id="allow-attachments" ${this.config.features.allowFileAttachments ? 'checked' : ''}>
                  Allow File Attachments (Future Feature)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="config-footer">
          <button class="btn btn-secondary" id="cancel-config">Cancel</button>
          <button class="btn btn-primary" id="save-config">Save Configuration</button>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Render the locations list
   */
  private renderLocationsList(): string {
    return this.config.locations.map(location => `
      <div class="config-item" data-type="location" data-id="${location.id}">
        <div class="config-item-header">
          <span class="config-item-name">${location.name}</span>
          <div class="config-item-actions">
            <button class="btn-icon edit-item" title="Edit">✏️</button>
            <button class="btn-icon toggle-item" title="${location.isActive ? 'Disable' : 'Enable'}">${location.isActive ? '👁️' : '🙈'}</button>
            <button class="btn-icon delete-item" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="config-item-details">
          <span class="detail-badge">Capacity: ${location.capacity || 'Not set'}</span>
          <span class="detail-badge status-${location.isActive ? 'active' : 'inactive'}">${location.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render the categories list
   */
  private renderCategoriesList(): string {
    return (this.config.customCategories || []).map(category => `
      <div class="config-item" data-type="category" data-id="${category.id}">
        <div class="config-item-header">
          <span class="config-item-name">
            <span class="color-preview" style="background-color: ${category.color}"></span>
            ${category.icon || '📁'} ${category.name}
          </span>
          <div class="config-item-actions">
            <button class="btn-icon edit-item" title="Edit">✏️</button>
            <button class="btn-icon toggle-item" title="${category.isActive ? 'Disable' : 'Enable'}">${category.isActive ? '👁️' : '🙈'}</button>
            <button class="btn-icon delete-item" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="config-item-details">
          <span class="detail-badge status-${category.isActive ? 'active' : 'inactive'}">${category.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render the priorities list
   */
  private renderPrioritiesList(): string {
    return (this.config.customPriorities || []).map(priority => `
      <div class="config-item" data-type="priority" data-id="${priority.id}">
        <div class="config-item-header">
          <span class="config-item-name">
            <span class="color-preview" style="background-color: ${priority.color}"></span>
            ${priority.name} (Level ${priority.level})
          </span>
          <div class="config-item-actions">
            <button class="btn-icon edit-item" title="Edit">✏️</button>
            <button class="btn-icon toggle-item" title="${priority.isActive ? 'Disable' : 'Enable'}">${priority.isActive ? '👁️' : '🙈'}</button>
            <button class="btn-icon delete-item" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="config-item-details">
          <span class="detail-badge status-${priority.isActive ? 'active' : 'inactive'}">${priority.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Attach event listeners to the configuration page
   */
  private attachEventListeners(): void {
    // Color input synchronization
    this.setupColorInputs();
    
    // Main action buttons
    document.getElementById('save-config')?.addEventListener('click', () => this.saveConfig());
    document.getElementById('cancel-config')?.addEventListener('click', () => this.cancel());
    document.getElementById('reset-config')?.addEventListener('click', () => this.resetConfig());
    document.getElementById('export-config')?.addEventListener('click', () => this.exportConfig());
    document.getElementById('import-config')?.addEventListener('click', () => this.importConfig());
    
    // Add buttons
    document.getElementById('add-location')?.addEventListener('click', () => this.addLocation());
    document.getElementById('add-category')?.addEventListener('click', () => this.addCategory());
    document.getElementById('add-priority')?.addEventListener('click', () => this.addPriority());
    
    // List item actions
    this.attachListItemListeners();
  }

  /**
   * Set up color input synchronization
   */
  private setupColorInputs(): void {
    const colorPairs = [
      ['primary-color', 'primary-color-text'],
      ['secondary-color', 'secondary-color-text']
    ];

    colorPairs.forEach(([colorId, textId]) => {
      const colorInput = document.getElementById(colorId) as HTMLInputElement;
      const textInput = document.getElementById(textId) as HTMLInputElement;

      colorInput?.addEventListener('input', () => {
        textInput.value = colorInput.value;
      });

      textInput?.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) {
          colorInput.value = textInput.value;
        }
      });
    });
  }

  /**
   * Attach listeners to list item actions
   */
  private attachListItemListeners(): void {
    // Edit, toggle, and delete buttons for all lists
    document.querySelectorAll('.edit-item').forEach(btn => {
      btn.addEventListener('click', (e) => this.editItem(e));
    });
    
    document.querySelectorAll('.toggle-item').forEach(btn => {
      btn.addEventListener('click', (e) => this.toggleItem(e));
    });
    
    document.querySelectorAll('.delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => this.deleteItem(e));
    });
  }

  /**
   * Save the configuration
   */
  private async saveConfig(): Promise<void> {
    try {
      // Collect all form data
      const updates: Partial<VenueConfig> = {
        companyName: (document.getElementById('company-name') as HTMLInputElement).value,
        logo: (document.getElementById('logo') as HTMLInputElement).value,
        tagline: (document.getElementById('tagline') as HTMLInputElement).value,
        primaryColor: (document.getElementById('primary-color') as HTMLInputElement).value,
        secondaryColor: (document.getElementById('secondary-color') as HTMLInputElement).value,
        venueName: (document.getElementById('venue-name') as HTMLInputElement).value,
        venueAddress: (document.getElementById('venue-address') as HTMLTextAreaElement).value,
        venuePhone: (document.getElementById('venue-phone') as HTMLInputElement).value,
        venueEmail: (document.getElementById('venue-email') as HTMLInputElement).value,
        venueWebsite: (document.getElementById('venue-website') as HTMLInputElement).value,
        timeFormat: (document.getElementById('time-format') as HTMLSelectElement).value as '12h' | '24h',
        dateFormat: (document.getElementById('date-format') as HTMLSelectElement).value as any,
        firstDayOfWeek: parseInt((document.getElementById('first-day-week') as HTMLSelectElement).value) as 0 | 1,
        defaultEventDuration: parseFloat((document.getElementById('default-duration') as HTMLInputElement).value),
        features: {
          showAttendees: (document.getElementById('show-attendees') as HTMLInputElement).checked,
          showLocation: (document.getElementById('show-location') as HTMLInputElement).checked,
          showDescription: (document.getElementById('show-description') as HTMLInputElement).checked,
          allowRecurring: (document.getElementById('allow-recurring') as HTMLInputElement).checked,
          allowFileAttachments: (document.getElementById('allow-attachments') as HTMLInputElement).checked
        }
      };

      // Update configuration
      await this.configService.updateConfig(updates);
      this.configService.applyTheme();

      alert('Configuration saved successfully!');
      this.goBack();
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please check your inputs.');
    }
  }

  /**
   * Cancel configuration changes
   */
  private cancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.goBack();
    }
  }

  /**
   * Reset configuration to defaults
   */
  private async resetConfig(): Promise<void> {
    alert('Reset to defaults from DB is not implemented in this UI yet.');
  }

  /**
   * Export configuration
   */
  private async exportConfig(): Promise<void> {
    const json = await this.configService.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event-planner-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import configuration
   */
  private async importConfig(): Promise<void> {
    const fileInput = document.getElementById('import-file') as HTMLInputElement;
    fileInput.click();
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          if (await this.configService.importConfig(content)) {
            alert('Configuration imported successfully!');
            this.render(); // Re-render with imported values
          } else {
            alert('Failed to import configuration. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
  }

  /**
   * Add a new location
   */
  private addLocation(): void {
    // This would open a modal or inline form to add a new location
    const name = prompt('Enter location name:');
    if (name) {
      const newLocation: LocationOption = {
        id: 'location-' + Date.now(),
        name,
        isActive: true
      };
      
      this.config.locations.push(newLocation);
      document.getElementById('locations-list')!.innerHTML = this.renderLocationsList();
      this.attachListItemListeners();
    }
  }

  /**
   * Add a new category
   */
  private addCategory(): void {
    const name = prompt('Enter category name:');
    if (name) {
      const newCategory: CategoryOption = {
        id: 'category-' + Date.now(),
        name,
        color: '#6b7280',
        isActive: true
      };
      
      if (!this.config.customCategories) this.config.customCategories = [];
      this.config.customCategories.push(newCategory);
      document.getElementById('categories-list')!.innerHTML = this.renderCategoriesList();
      this.attachListItemListeners();
    }
  }

  /**
   * Add a new priority
   */
  private addPriority(): void {
    const name = prompt('Enter priority name:');
    if (name) {
      const level = parseInt(prompt('Enter priority level (1-10):') || '5');
      const newPriority: PriorityOption = {
        id: 'priority-' + Date.now(),
        name,
        color: '#6b7280',
        level: Math.max(1, Math.min(10, level)),
        isActive: true
      };
      
      if (!this.config.customPriorities) this.config.customPriorities = [];
      this.config.customPriorities.push(newPriority);
      document.getElementById('priorities-list')!.innerHTML = this.renderPrioritiesList();
      this.attachListItemListeners();
    }
  }

  /**
   * Edit an item (location, category, or priority)
   */
  private editItem(_e: Event): void {
    // Implementation would open edit dialogs for each type
    alert('Edit functionality would open a detailed form for this item.');
  }

  /**
   * Toggle item active status
   */
  private toggleItem(e: Event): void {
    const button = e.target as HTMLElement;
    const item = button.closest('.config-item');
    const type = item?.getAttribute('data-type');
    const id = item?.getAttribute('data-id');

    if (type && id) {
      if (type === 'location') {
        const location = this.config.locations.find(l => l.id === id);
        if (location) location.isActive = !location.isActive;
      } else if (type === 'category') {
        const category = this.config.customCategories?.find(c => c.id === id);
        if (category) category.isActive = !category.isActive;
      } else if (type === 'priority') {
        const priority = this.config.customPriorities?.find(p => p.id === id);
        if (priority) priority.isActive = !priority.isActive;
      }

      // Re-render the specific list
      this.refreshList(type);
    }
  }

  /**
   * Delete an item
   */
  private deleteItem(e: Event): void {
    if (!confirm('Are you sure you want to delete this item?')) return;

    const button = e.target as HTMLElement;
    const item = button.closest('.config-item');
    const type = item?.getAttribute('data-type');
    const id = item?.getAttribute('data-id');

    if (type && id) {
      if (type === 'location') {
        this.config.locations = this.config.locations.filter(l => l.id !== id);
      } else if (type === 'category') {
        this.config.customCategories = this.config.customCategories?.filter(c => c.id !== id);
      } else if (type === 'priority') {
        this.config.customPriorities = this.config.customPriorities?.filter(p => p.id !== id);
      }

      // Re-render the specific list
      this.refreshList(type);
    }
  }

  /**
   * Refresh a specific list after changes
   */
  private refreshList(type: string): void {
    let listElement: HTMLElement | null = null;
    let newContent = '';

    switch (type) {
      case 'location':
        listElement = document.getElementById('locations-list');
        newContent = this.renderLocationsList();
        break;
      case 'category':
        listElement = document.getElementById('categories-list');
        newContent = this.renderCategoriesList();
        break;
      case 'priority':
        listElement = document.getElementById('priorities-list');
        newContent = this.renderPrioritiesList();
        break;
    }

    if (listElement) {
      listElement.innerHTML = newContent;
      this.attachListItemListeners();
    }
  }

  /**
   * Go back to the dashboard
   */
  private goBack(): void {
    // This would use the router to navigate back
    if ((window as any).router) {
      (window as any).router.navigateTo('/');
    }
  }
}
