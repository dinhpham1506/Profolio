import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private scrollNavigationEnabled = new BehaviorSubject<boolean>(true);
  private manualNavigationInProgress = new BehaviorSubject<boolean>(false);

  scrollNavigationEnabled$ = this.scrollNavigationEnabled.asObservable();
  manualNavigationInProgress$ = this.manualNavigationInProgress.asObservable();

  constructor() { }

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
      // Re-enable after 2 seconds
      setTimeout(() => {
        this.enableScrollNavigation();
      }, 2000);
    }
  }

  isScrollNavigationEnabled(): boolean {
    return this.scrollNavigationEnabled.value;
  }

  isManualNavigationInProgress(): boolean {
    return this.manualNavigationInProgress.value;
  }
}