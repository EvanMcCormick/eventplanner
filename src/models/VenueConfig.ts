/**
 * Configuration model for venue and application customization
 * This defines the structure for company-specific settings
 */
export interface VenueConfig {
  // Branding
  companyName: string;
  logo: string; // URL or path to logo image
  tagline?: string;
  primaryColor: string;
  secondaryColor: string;
  
  // Venue Information
  venueName: string;
  venueAddress?: string;
  venuePhone?: string;
  venueEmail?: string;
  venueWebsite?: string;
  
  // Location Options (for event location dropdown)
  locations: LocationOption[];
  
  // Category Options (custom event categories)
  customCategories?: CategoryOption[];
  
  // Priority Options (custom priority levels)
  customPriorities?: PriorityOption[];
  
  // Event Defaults
  defaultEventDuration: number; // in hours
  defaultCategory: string;
  defaultPriority: string;
  
  // Application Settings
  timeFormat: '12h' | '24h';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  
  // Feature Flags
  features: {
    showAttendees: boolean;
    showLocation: boolean;
    showDescription: boolean;
    allowRecurring: boolean;
    allowFileAttachments: boolean;
  };
}

/**
 * Location option for dropdown menus
 */
export interface LocationOption {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  amenities?: string[];
  isActive: boolean;
}

/**
 * Custom category option
 */
export interface CategoryOption {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isActive: boolean;
}

/**
 * Custom priority option
 */
export interface PriorityOption {
  id: string;
  name: string;
  color: string;
  level: number; // 1-10 for sorting
  isActive: boolean;
}

/**
 * Default configuration for new installations
 */
export const DEFAULT_CONFIG: VenueConfig = {
  // Branding
  companyName: 'Event Planner',
  logo: '📅',
  tagline: 'Organize your events with ease',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  
  // Venue Information
  venueName: 'Main Venue',
  venueAddress: '',
  venuePhone: '',
  venueEmail: '',
  venueWebsite: '',
  
  // Location Options
  locations: [
    {
      id: 'main-hall',
      name: 'Main Hall',
      description: 'Large conference hall with A/V equipment',
      capacity: 200,
      amenities: ['Projector', 'Sound System', 'WiFi', 'Air Conditioning'],
      isActive: true
    },
    {
      id: 'meeting-room-a',
      name: 'Meeting Room A',
      description: 'Small meeting room for team discussions',
      capacity: 12,
      amenities: ['Whiteboard', 'WiFi', 'Conference Phone'],
      isActive: true
    },
    {
      id: 'meeting-room-b',
      name: 'Meeting Room B',
      description: 'Medium meeting room with presentation setup',
      capacity: 20,
      amenities: ['TV Display', 'WiFi', 'Video Conferencing'],
      isActive: true
    },
    {
      id: 'outdoor-space',
      name: 'Outdoor Patio',
      description: 'Covered outdoor area for social events',
      capacity: 50,
      amenities: ['Tables', 'Chairs', 'Lighting'],
      isActive: true
    },
    {
      id: 'virtual',
      name: 'Virtual/Online',
      description: 'Online meeting or webinar',
      isActive: true
    }
  ],
  
  // Custom Categories (extends default ones)
  customCategories: [
    {
      id: 'training',
      name: 'Training',
      color: '#10b981',
      icon: '🎓',
      isActive: true
    },
    {
      id: 'workshop',
      name: 'Workshop',
      color: '#f59e0b',
      icon: '🔨',
      isActive: true
    },
    {
      id: 'conference',
      name: 'Conference',
      color: '#3b82f6',
      icon: '🎤',
      isActive: true
    }
  ],
  
  // Custom Priorities (extends default ones)
  customPriorities: [
    {
      id: 'critical',
      name: 'Critical',
      color: '#dc2626',
      level: 10,
      isActive: true
    },
    {
      id: 'important',
      name: 'Important',
      color: '#f59e0b',
      level: 7,
      isActive: true
    },
    {
      id: 'normal',
      name: 'Normal',
      color: '#6b7280',
      level: 5,
      isActive: true
    },
    {
      id: 'low',
      name: 'Low',
      color: '#10b981',
      level: 2,
      isActive: true
    }
  ],
  
  // Event Defaults
  defaultEventDuration: 1,
  defaultCategory: 'meeting',
  defaultPriority: 'normal',
  
  // Application Settings
  timeFormat: '12h',
  dateFormat: 'MM/DD/YYYY',
  firstDayOfWeek: 0,
  
  // Feature Flags
  features: {
    showAttendees: true,
    showLocation: true,
    showDescription: true,
    allowRecurring: false,
    allowFileAttachments: false
  }
};
