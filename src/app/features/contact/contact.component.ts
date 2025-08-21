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
  private hasNavigated = false;
  private isBrowser: boolean;
  private allowScrollNavigation = false;
  private lastScrollTop = 0;
  allowNavigation = true;
  currentYear = new Date().getFullYear();
  private config: any;

  // Typewriter effect properties
  typewriterText: string = "LET'S GET<br>IN TOUCH.";
  displayedText: string = '';
  private typewriterIndex = 0;
  private typewriterTimeout: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private navigationService: NavigationService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.config = this.navigationService.getNavigationConfig();
    this.hasNavigated = false;
    this.allowScrollNavigation = false;
    
    // Allow scroll navigation after configured delay to prevent immediate loop
    setTimeout(() => {
      this.allowScrollNavigation = true;
    }, this.config.navigationDelay);

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
          
          // Use consistent delay to prevent loop
          setTimeout(() => {
            this.allowScrollNavigation = true;
          }, this.config.navigationDelay);
          
          // Restart typewriter effect
          this.startTypewriter();
        }
      });
    }

    // Initialize scroll animations and typewriter
    if (this.isBrowser) {
      this.initScrollAnimations();
      this.startTypewriter();
    }
  }

  ngOnDestroy(): void {
    this.hasNavigated = false;
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
  }

  private startTypewriter() {
    this.displayedText = '';
    this.typewriterIndex = 0;
    // Clear any existing timeout
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
    this.typeChar();
  }
  
  private typeChar() {
    if (this.typewriterIndex <= this.typewriterText.length) {
      this.displayedText = this.typewriterText.slice(0, this.typewriterIndex);
      this.typewriterIndex++;
      this.typewriterTimeout = setTimeout(() => this.typeChar(), 50);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isBrowser) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Debug logging
    console.log('Contact scroll:', {
      scrollTop,
      lastScrollTop: this.lastScrollTop,
      threshold: this.config.scrollThreshold,
      allowNavigation: this.allowScrollNavigation,
      hasNavigated: this.hasNavigated,
      scrollDirection: scrollTop > this.lastScrollTop ? 'down' : 'up'
    });
    
    // Navigate to portfolio when scrolling up from top
    if (this.navigationService.shouldNavigate(
      scrollTop, 
      this.lastScrollTop, 
      this.allowScrollNavigation, 
      this.hasNavigated, 
      true
    )) {
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
