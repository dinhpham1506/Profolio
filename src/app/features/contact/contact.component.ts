import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NavigationService } from '../../shared/navigation.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit, OnDestroy {
  private scrollThreshold = 100; // Scroll threshold
  private hasNavigated = false;
  private isBrowser: boolean;
  private allowScrollNavigation = false;
  private lastScrollTop = 0;
  allowNavigation = true;
  currentYear = new Date().getFullYear();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private navigationService: NavigationService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.hasNavigated = false;
    this.allowScrollNavigation = false;
    
    // Allow scroll navigation after 2 seconds to prevent immediate loop
    setTimeout(() => {
      this.allowScrollNavigation = true;
    }, 2000);

    // Listen to route changes to reset navigation state
    if (this.isBrowser) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        if (event.url === '/contact') {
          // Reset navigation state when arriving at contact page
          this.hasNavigated = false;
          this.allowScrollNavigation = false;
          this.lastScrollTop = 0;
          
          // Longer delay if coming from portfolio to prevent loop
          setTimeout(() => {
            this.allowScrollNavigation = true;
          }, 3000);
        }
      });
    }

    // Initialize scroll animations
    if (this.isBrowser) {
      this.initScrollAnimations();
    }
  }

  ngOnDestroy(): void {
    this.hasNavigated = false;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isBrowser || this.hasNavigated || !this.allowScrollNavigation) return;
    
    // Check if scroll navigation is enabled
    if (!this.navigationService.isScrollNavigationEnabled()) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
    
    // Debug logging
    console.log('Contact scroll:', {
      scrollTop,
      lastScrollTop: this.lastScrollTop,
      threshold: this.scrollThreshold,
      allowNavigation: this.allowScrollNavigation,
      hasNavigated: this.hasNavigated,
      distanceFromBottom,
      scrollDirection: scrollTop > this.lastScrollTop ? 'down' : 'up',
      upCondition: scrollTop <= this.scrollThreshold && scrollTop < this.lastScrollTop && this.lastScrollTop > 400,
      downCondition: distanceFromBottom <= this.scrollThreshold && scrollTop > this.lastScrollTop
    });
    
    // Navigate to portfolio when scrolling up from top (with higher threshold to prevent loop)
    if (scrollTop <= this.scrollThreshold && scrollTop < this.lastScrollTop && this.lastScrollTop > 500) {
      console.log('Navigating to portfolio from contact');
      this.hasNavigated = true;
      this.router.navigate(['/portfolio']).then(() => {
        // Scroll to bottom of portfolio to maintain reverse flow
        setTimeout(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
        }, 100);
      });
    }
    // Contact page should not navigate anywhere when scrolling down
    // Users should stay on contact page
    
    this.lastScrollTop = scrollTop;
  }

  private initScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all elements with animate-on-scroll class
    setTimeout(() => {
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach(el => observer.observe(el));
    }, 100);
  }
}
