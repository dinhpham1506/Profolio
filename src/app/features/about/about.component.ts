import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavigationService } from '../../shared/navigation.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit, OnDestroy, AfterViewInit {
  currentYear = new Date().getFullYear();
  nextPageName = 'Resume';
  private scrollThreshold = 200; // Reduced threshold for better responsiveness
  private hasNavigated = false;
  private isBrowser: boolean;
  private allowScrollNavigation = false;
  private navigationTimeout: any;
  private lastScrollTop = 0;

  // Typewriter effect - PHẢI PUBLIC để dùng trong template
  typewriterText: string = 'HI, I AM<br>DINH.';
  displayedText: string = '';
  private typewriterIndex = 0;
  private typewriterTimeout: any;

  constructor(
    private router: Router,
    private navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
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
      this.typewriterTimeout = setTimeout(() => this.typeChar(), 50); // Thay đổi từ 90ms thành 50ms để nhanh hơn
    }
  }

  ngOnInit() {
    this.hasNavigated = false;
    this.allowScrollNavigation = false;
    
    // Allow scroll navigation after 1 second to prevent immediate navigation
    this.navigationTimeout = setTimeout(() => {
      this.allowScrollNavigation = true;
    }, 1000);
    
    // Listen to route changes to reset navigation flag
    if (this.isBrowser) {
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        if (event.url === '/about') {
          this.hasNavigated = false;
          this.allowScrollNavigation = false;
          // Reset timer when navigating back to about
          clearTimeout(this.navigationTimeout);
          this.navigationTimeout = setTimeout(() => {
            this.allowScrollNavigation = true;
          }, 1000);
          
          // Trigger animations when navigating to about page
          this.triggerAnimations();
          // Restart typewriter effect
          this.startTypewriter();
        }
      });
    }
  }

  ngAfterViewInit() {
    // Reset flag after view is initialized
    setTimeout(() => {
      this.hasNavigated = false;
    }, 100);
    
    // Initialize scroll animations when component loads
    if (this.isBrowser) {
      this.initScrollAnimations();
      this.triggerAnimations();
      this.startTypewriter(); // Ensure typewriter effect starts here
    }
  }
  
  private triggerAnimations() {
    // Force trigger animations for elements that should be visible
    setTimeout(() => {
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // If element is in viewport or close to it, trigger animation
        if (elementTop < windowHeight * 0.8) {
          element.classList.add('visible');
        }
      });
    }, 200);
  }

  private initScrollAnimations(): void {
    if (!this.isBrowser) return;
    
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

  ngOnDestroy() {
    this.hasNavigated = false;
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
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
    console.log('About scroll:', {
      scrollTop,
      lastScrollTop: this.lastScrollTop,
      threshold: this.scrollThreshold,
      allowNavigation: this.allowScrollNavigation,
      hasNavigated: this.hasNavigated,
      distanceFromBottom,
      scrollDirection: scrollTop > this.lastScrollTop ? 'down' : 'up'
    });
    
    // Navigate to contact when scrolling up from top (reverse navigation)
    if (scrollTop <= this.scrollThreshold && scrollTop < this.lastScrollTop && this.lastScrollTop > 400) {
      console.log('Navigating to contact from about');
      this.hasNavigated = true;
      this.router.navigate(['/contact']).then(() => {
        // Scroll to bottom of contact page to maintain flow
        setTimeout(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
        }, 100);
      });
    }
    // Navigate to resume when scrolling down to bottom
    else if (distanceFromBottom <= this.scrollThreshold && scrollTop > this.lastScrollTop) {
      console.log('Navigating to resume from about');
      this.hasNavigated = true;
      this.router.navigate(['/resume']).then(() => {
        window.scrollTo(0, 0);
      });
    }
    
    this.lastScrollTop = scrollTop;
  }
}