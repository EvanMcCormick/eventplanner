import type { VenueConfig } from '../models/VenueConfig.js';
import { DEFAULT_CONFIG } from '../models/VenueConfig.js';

/**
 * Service for managing venue configuration
 * Handles loading, saving, and updating configuration settings
 */
export class ConfigService {
  private static readonly STORAGE_KEY = 'event-planner-config';
  private static instance: ConfigService | null = null;
  private config: VenueConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Get the singleton instance of ConfigService
   */
  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Load configuration from localStorage
   * If no config exists, returns default configuration
   */
  private loadConfig(): VenueConfig {
    try {
      const stored = localStorage.getItem(ConfigService.STORAGE_KEY);
      if (stored) {
        const parsedConfig = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_CONFIG, ...parsedConfig };
      }
    } catch (error) {
      console.warn('Failed to load configuration, using defaults:', error);
    }
    
    return { ...DEFAULT_CONFIG };
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(ConfigService.STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  /**
   * Get the current configuration
   */
  public getConfig(): VenueConfig {
    return { ...this.config };
  }

  /**
   * Update the configuration with new values
   */
  public updateConfig(updates: Partial<VenueConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }

  /**
   * Get active locations (for dropdown menus)
   */
  public getActiveLocations() {
    return this.config.locations.filter(location => location.isActive);
  }

  /**
   * Get all categories (default + custom active ones)
   */
  public getAllCategories() {
    const defaultCategories = [
      { id: 'meeting', name: 'Meeting', color: '#3b82f6' },
      { id: 'personal', name: 'Personal', color: '#10b981' },
      { id: 'work', name: 'Work', color: '#f59e0b' },
      { id: 'other', name: 'Other', color: '#6b7280' }
    ];

    const customCategories = (this.config.customCategories || [])
      .filter(cat => cat.isActive)
      .map(cat => ({ id: cat.id, name: cat.name, color: cat.color }));

    return [...defaultCategories, ...customCategories];
  }

  /**
   * Get all priorities (default + custom active ones)
   */
  public getAllPriorities() {
    const defaultPriorities = [
      { id: 'high', name: 'High', color: '#ef4444' },
      { id: 'medium', name: 'Medium', color: '#f59e0b' },
      { id: 'low', name: 'Low', color: '#10b981' }
    ];

    const customPriorities = (this.config.customPriorities || [])
      .filter(priority => priority.isActive)
      .map(priority => ({ id: priority.id, name: priority.name, color: priority.color }))
      .sort((a, b) => {
        const aLevel = this.config.customPriorities?.find(p => p.id === a.id)?.level || 5;
        const bLevel = this.config.customPriorities?.find(p => p.id === b.id)?.level || 5;
        return bLevel - aLevel; // Sort descending (highest priority first)
      });

    return [...defaultPriorities, ...customPriorities];
  }

  /**
   * Apply theme colors to CSS custom properties
   */
  public applyTheme(): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', this.config.primaryColor);
    root.style.setProperty('--secondary-color', this.config.secondaryColor);
  }

  /**
   * Get formatted date string based on user preference
   */
  public formatDate(date: Date): string {
    const format = this.config.dateFormat;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
      default:
        return `${month}/${day}/${year}`;
    }
  }

  /**
   * Get formatted time string based on user preference
   */
  public formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: this.config.timeFormat === '12h'
    };
    
    return date.toLocaleTimeString('en-US', options);
  }

  /**
   * Export configuration as JSON string
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON string
   */
  public importConfig(jsonString: string): boolean {
    try {
      const importedConfig = JSON.parse(jsonString);
      // Validate that it has the required structure
      if (importedConfig && typeof importedConfig === 'object') {
        this.config = { ...DEFAULT_CONFIG, ...importedConfig };
        this.saveConfig();
        this.applyTheme();
        return true;
      }
    } catch (error) {
      console.error('Failed to import configuration:', error);
    }
    return false;
  }
}
