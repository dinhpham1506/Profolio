import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Unified navigation configuration
export interface NavigationConfig {
  scrollThreshold: number;
  navigationDelay: number;
  minScrollDistance: number;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private scrollNavigationEnabled = new BehaviorSubject<boolean>(true);
  private manualNavigationInProgress = new BehaviorSubject<boolean>(false);

  scrollNavigationEnabled$ = this.scrollNavigationEnabled.asObservable();
  manualNavigationInProgress$ = this.manualNavigationInProgress.asObservable();

  // Unified navigation configuration for all components
  private readonly config: NavigationConfig = {
    scrollThreshold: 150, // Consistent threshold for all components
    navigationDelay: 5000, // 5-second delay to allow reading content
    minScrollDistance: 100 // Reduced minimum scroll distance for better responsiveness
  };

  constructor() { }

  getNavigationConfig(): NavigationConfig {
    return { ...this.config };
  }

  enableScrollNavigation() {
    this.scrollNavigationEnabled.next(true);
  }

  disableScrollNavigation() {
    this.scrollNavigationEnabled.next(false);
  }

  setManualNavigationInProgress(inProgress: boolean) {
    this.manualNavigationInProgress.next(inProgress);
    
    // Disable scroll navigation temporarily during manual navigation
    if (inProgress) {
      this.disableScrollNavigation();
      // Re-enable after configured delay
      setTimeout(() => {
        this.enableScrollNavigation();
      }, this.config.navigationDelay);
    }
  }

  isScrollNavigationEnabled(): boolean {
    return this.scrollNavigationEnabled.value;
  }

  isManualNavigationInProgress(): boolean {
    return this.manualNavigationInProgress.value;
  }

  // Helper method to check if scroll navigation should trigger
  shouldNavigate(
    scrollTop: number, 
    lastScrollTop: number, 
    allowNavigation: boolean, 
    hasNavigated: boolean,
    isScrollingUp: boolean = false,
    documentHeight?: number,
    windowHeight?: number
  ): boolean {
    const isScrollNavEnabled = this.isScrollNavigationEnabled();
    const hasScrolledEnough = lastScrollTop > this.config.minScrollDistance;

    if (!isScrollNavEnabled || !allowNavigation || hasNavigated) {
      return false;
    }

    if (isScrollingUp) {
      return scrollTop <= this.config.scrollThreshold && 
             scrollTop < lastScrollTop && 
             hasScrolledEnough;
    } else {
      // Scrolling down
      if (documentHeight && windowHeight) {
        const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
        return distanceFromBottom <= this.config.scrollThreshold && 
               scrollTop > lastScrollTop &&
               hasScrolledEnough;
      }
      return false;
    }
  }
}