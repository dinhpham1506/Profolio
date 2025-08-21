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
  private hasNavigated = false;
  private isBrowser: boolean;
  private allowScrollNavigation = false;
  private navigationTimeout: any;
  private lastScrollTop = 0;
  private config: any;

  // Typewriter effect - PHẢI PUBLIC để dùng trong template
  typewriterText: string = 'HI, I AM<br>DINH.';
  displayedText: string = '';
  private typewriterIndex = 0;
  private typewriterTimeout: any;

  // Paragraph typewriter
  paragraphText: string = 'A Ho Chi Minh City based software engineering student passionate about building real-world applications, mastering Java/OOP, and collaborating in Agile teams to create user-friendly solutions.';
  displayedParagraph: string = '';
  paragraphIndex = 0; // Made public for template
  paragraphTypingComplete = false; // Track completion
  private paragraphTimeout: any;

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
      
      if (this.typewriterIndex <= this.typewriterText.length) {
        this.typewriterTimeout = setTimeout(() => this.typeChar(), 50);
      } else {
        // H1 typing is complete, start paragraph typing immediately
        setTimeout(() => {
          this.startParagraphTyping();
        }, 500); // Start paragraph typing quickly
      }
    }
  }

  private startParagraphTyping() {
    this.displayedParagraph = '';
    this.paragraphIndex = 0;
    this.paragraphTypingComplete = false;
    if (this.paragraphTimeout) {
      clearTimeout(this.paragraphTimeout);
    }
    this.typeParagraphChar();
  }

  private typeParagraphChar() {
    if (this.paragraphIndex < this.paragraphText.length) {
      this.displayedParagraph = this.paragraphText.slice(0, this.paragraphIndex + 1);
      this.paragraphIndex++;
      this.paragraphTimeout = setTimeout(() => this.typeParagraphChar(), 30);
    } else {
      // Typing complete, hide cursor after a delay
      setTimeout(() => {
        this.paragraphTypingComplete = true;
      }, 1000);
    }
  }

  ngOnInit() {
    this.config = this.navigationService.getNavigationConfig();
    this.hasNavigated = false;
    this.allowScrollNavigation = false;
    
    // Allow scroll navigation after configured delay to prevent immediate navigation
    this.navigationTimeout = setTimeout(() => {
      this.allowScrollNavigation = true;
    }, this.config.navigationDelay);
    
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
          }, this.config.navigationDelay);
          
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

      // Trigger typing reveal for paragraph after H1 completes
      setTimeout(() => {
        const typingElement = document.querySelector('.typing-reveal');
        if (typingElement) {
          typingElement.classList.add('active');
          
          // Remove typing cursor after animation completes
          setTimeout(() => {
            typingElement.classList.add('complete');
          }, 4500);
        }
      }, 2000); // Wait for H1 typing to complete
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
    if (this.paragraphTimeout) {
      clearTimeout(this.paragraphTimeout);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isBrowser) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    
    // Debug logging removed for production
    
    // Navigate to contact when scrolling up from top (reverse navigation)
    if (this.navigationService.shouldNavigate(
      scrollTop, 
      this.lastScrollTop, 
      this.allowScrollNavigation, 
      this.hasNavigated, 
      true
    )) {
      this.hasNavigated = true;
      this.navigationService.setManualNavigationInProgress(true);
      this.router.navigate(['/contact']).then((success) => {
        if (success) {
          // Scroll to bottom of contact page to maintain flow
          setTimeout(() => {
            window.scrollTo(0, document.documentElement.scrollHeight);
          }, 100);
        }
      }).catch((error) => {
        this.hasNavigated = false;
      });
    }
    // Navigate to resume when scrolling down to bottom
    else if (this.navigationService.shouldNavigate(
      scrollTop, 
      this.lastScrollTop, 
      this.allowScrollNavigation, 
      this.hasNavigated, 
      false,
      documentHeight,
      windowHeight
    )) {
      this.hasNavigated = true;
      this.navigationService.setManualNavigationInProgress(true);
      this.router.navigate(['/resume']).then((success) => {
        if (success) {
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 50);
        }
      }).catch((error) => {
        this.hasNavigated = false;
      });
    }
    
    this.lastScrollTop = scrollTop;
  }
}