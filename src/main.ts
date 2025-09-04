import { Dashboard } from './components/Dashboard.js';
import { ConfigService } from './services/ConfigService.js';
import './styles/main.scss';
import './styles/calendar.scss';
import './styles/components.scss';
import './styles/event-editor.scss';
import './styles/config.scss';
import './utils/sampleData.js'; // Import sample data utility

/**
 * Initialize the Event Planner application
 */
function initApp(): void {
  const appContainer = document.querySelector<HTMLElement>('#app');
  
  if (!appContainer) {
    throw new Error('App container not found');
  }

  // Initialize configuration service and apply theme
  const configService = ConfigService.getInstance();
  configService.applyTheme();

  // Create and initialize the dashboard
  new Dashboard(appContainer);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
