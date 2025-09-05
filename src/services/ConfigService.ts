import type { VenueConfig } from '../models/VenueConfig.js';

/**
 * ConfigService now loads/saves configuration via backend API (SQL Server)
 */
export class ConfigService {
  private static instance: ConfigService | null = null;
  private config: VenueConfig | null = null;
  private static readonly API_BASE = '/api';
  private venueCode = 'DEMO'; // could be dynamic later

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private async ensureLoaded() {
    if (this.config) return;
    const res = await fetch(`${ConfigService.API_BASE}/config/${this.venueCode}`);
    if (!res.ok) throw new Error('Failed to load configuration');
    const r = await res.json();

    this.config = {
      companyName: r.CompanyName,
      logo: r.Logo ?? '📅',
      tagline: r.Tagline ?? '',
      primaryColor: r.PrimaryColor,
      secondaryColor: r.SecondaryColor,
      venueName: r.VenueName,
      venueAddress: r.Address ?? '',
      venuePhone: r.ContactPhone ?? '',
      venueEmail: r.ContactEmail ?? '',
      venueWebsite: r.Website ?? '',
      locations: [],
      customCategories: [],
      customPriorities: [],
      defaultEventDuration: r.DefaultEventDuration ?? 1,
      defaultCategory: r.DefaultCategory ?? 'meeting',
      defaultPriority: r.DefaultPriority ?? 'normal',
      timeFormat: (r.TimeFormat ?? '12h'),
      dateFormat: (r.DateFormat ?? 'MM/DD/YYYY'),
      firstDayOfWeek: (r.FirstDayOfWeek ?? 0),
      features: {
        showAttendees: !!r.ShowAttendees,
        showLocation: !!r.ShowLocation,
        showDescription: !!r.ShowDescription,
        allowRecurring: !!r.AllowRecurring,
        allowFileAttachments: !!r.AllowFileAttachments,
      },
    } as VenueConfig;

    // Load lists from API
    const venueId = r.VenueId || r.venueId;
    const [catsRes, priosRes, locsRes] = await Promise.all([
      fetch(`${ConfigService.API_BASE}/categories?venueId=${venueId}`),
      fetch(`${ConfigService.API_BASE}/priorities?venueId=${venueId}`),
      fetch(`${ConfigService.API_BASE}/locations?venueId=${venueId}`),
    ]);

    const [cats, prios, locs] = await Promise.all([
      catsRes.ok ? catsRes.json() : [],
      priosRes.ok ? priosRes.json() : [],
      locsRes.ok ? locsRes.json() : [],
    ]);

    this.config.locations = (locs || []).map((l: any) => ({
      id: l.LocationId,
      name: l.LocationName,
      description: l.Description ?? '',
      capacity: l.Capacity ?? undefined,
      amenities: (l.Amenities ? String(l.Amenities).split(',') : []),
      isActive: true,
    }));

    this.config.customCategories = (cats || []).map((c: any) => ({
      id: c.CategoryCode,
      name: c.CategoryName,
      color: c.Color,
      icon: c.Icon ?? '',
      isActive: true,
    }));

    this.config.customPriorities = (prios || []).map((p: any) => ({
      id: p.PriorityCode,
      name: p.PriorityName,
      color: p.Color,
      level: p.Level ?? 5,
      isActive: true,
    }));
  }

  public async getConfig(): Promise<VenueConfig> {
    await this.ensureLoaded();
    return { ...(this.config as VenueConfig) };
  }

  public async updateConfig(updates: Partial<VenueConfig>): Promise<void> {
    await this.ensureLoaded();
    const current = this.config as VenueConfig;
    const merged = { ...current, ...updates } as VenueConfig;

    // Persist to API (maps to sp_UpdateVenueConfiguration)
    const payload = {
      venueId: await this.getVenueId(),
      companyName: merged.companyName,
      logo: merged.logo,
      tagline: merged.tagline,
      primaryColor: merged.primaryColor,
      secondaryColor: merged.secondaryColor,
      timeFormat: merged.timeFormat,
      dateFormat: merged.dateFormat,
      firstDayOfWeek: merged.firstDayOfWeek,
      defaultEventDuration: merged.defaultEventDuration,
      defaultCategory: merged.defaultCategory,
      defaultPriority: merged.defaultPriority,
      showAttendees: merged.features.showAttendees,
      showLocation: merged.features.showLocation,
      showDescription: merged.features.showDescription,
      allowRecurring: merged.features.allowRecurring,
      allowFileAttachments: merged.features.allowFileAttachments,
    };

    const res = await fetch(`${ConfigService.API_BASE}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to update configuration');

    this.config = merged;
    this.applyTheme();
  }

  public applyTheme(): void {
    if (!this.config) return;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', this.config.primaryColor);
    root.style.setProperty('--secondary-color', this.config.secondaryColor);
  }

  public async getActiveLocations() {
    const cfg = await this.getConfig();
    return cfg.locations.filter(l => l.isActive);
  }

  public async getAllCategories() {
    const cfg = await this.getConfig();
    // Default base categories
    const defaultCategories = [
      { id: 'meeting', name: 'Meeting', color: '#3b82f6' },
      { id: 'personal', name: 'Personal', color: '#10b981' },
      { id: 'work', name: 'Work', color: '#f59e0b' },
      { id: 'other', name: 'Other', color: '#6b7280' },
    ];
    return [...defaultCategories, ...(cfg.customCategories || [])];
  }

  public async getAllPriorities() {
    const cfg = await this.getConfig();
    const defaultPriorities = [
      { id: 'high', name: 'High', color: '#ef4444' },
      { id: 'medium', name: 'Medium', color: '#f59e0b' },
      { id: 'low', name: 'Low', color: '#10b981' },
    ];
    const custom = (cfg.customPriorities || []).sort((a, b) => b.level - a.level);
    return [...defaultPriorities, ...custom];
  }

  public async exportConfig(): Promise<string> {
    const cfg = await this.getConfig();
    return JSON.stringify(cfg, null, 2);
    }

  public async importConfig(jsonString: string): Promise<boolean> {
    try {
      const imported = JSON.parse(jsonString);
      await this.updateConfig(imported);
      return true;
    } catch (e) {
      console.error('Failed to import configuration:', e);
      return false;
    }
  }

  private async getVenueId(): Promise<string> {
    const res = await fetch(`${ConfigService.API_BASE}/config/${this.venueCode}`);
    const c = await res.json();
    return c.VenueId || c.venueId;
  }
}
