/**
 * Simple router for handling page navigation in the Event Planner
 * Manages switching between dashboard and event editor pages
 */
export class Router {
  private currentPage: string = 'dashboard';
  private onPageChange?: (page: string, data?: any) => void;

  /**
   * Set callback for page changes
   */
  public onNavigate(callback: (page: string, data?: any) => void): void {
    this.onPageChange = callback;
  }

  /**
   * Navigate to a specific page
   */
  public navigateTo(page: string, data?: any): void {
    this.currentPage = page;
    
    // Update browser history
    const url = page === 'dashboard' ? '/' : `/${page}`;
    window.history.pushState({ page, data }, '', url);
    
    if (this.onPageChange) {
      this.onPageChange(page, data);
    }
  }

  /**
   * Go back to previous page
   */
  public goBack(): void {
    window.history.back();
  }

  /**
   * Get current page
   */
  public getCurrentPage(): string {
    return this.currentPage;
  }

  /**
   * Initialize router and handle browser back/forward buttons
   */
  public init(): void {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      const state = event.state;
      if (state) {
        this.currentPage = state.page || 'dashboard';
        if (this.onPageChange) {
          this.onPageChange(this.currentPage, state.data);
        }
      } else {
        this.currentPage = 'dashboard';
        if (this.onPageChange) {
          this.onPageChange('dashboard');
        }
      }
    });

    // Set initial state
    window.history.replaceState({ page: 'dashboard' }, '', '/');
  }
}
