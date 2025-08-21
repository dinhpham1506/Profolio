import { Component, OnInit, HostListener, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HireMeCircleComponent } from './shared/hire-me-circle/hire-me-circle.component';
import { NavigationService } from './shared/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HireMeCircleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'portfolio';
  currentYear = new Date().getFullYear();
  private lastScrollTop = 0;
  private navbarElement: HTMLElement | null = null;
  private isBrowser: boolean;
  isMobileMenuOpen = false;
  currentPageTitle = 'Dinh Pham';
  isScrolled = false;

  constructor(
    private elementRef: ElementRef, 
    private router: Router,
    private navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.navbarElement = this.elementRef.nativeElement.querySelector('nav');
      this.setupScrollAnimations();
      
      // Listen to route changes
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.updateProgressLine();
        this.updatePageTitle(event.url);
      });
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.updateProgressLine();
      this.updatePageTitle(this.router.url);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isBrowser) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Update scroll state
    this.isScrolled = scrollTop > 100;
    
    // Navbar scroll effects
    if (this.navbarElement) {
      if (scrollTop > 100) {
        this.navbarElement.classList.add('scrolled');
      } else {
        this.navbarElement.classList.remove('scrolled');
      }

      // Hide/show navbar on scroll
      if (scrollTop > this.lastScrollTop && scrollTop > 200) {
        this.navbarElement.classList.add('hidden');
      } else {
        this.navbarElement.classList.remove('hidden');
      }
    }

    this.lastScrollTop = scrollTop;
    this.animateOnScroll();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    if (!this.isBrowser) return;
    
    // Close mobile menu when resizing to desktop
    if (window.innerWidth > 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  private setupScrollAnimations() {
    if (!this.isBrowser) return;
    
    // Initial check for elements in viewport
    setTimeout(() => {
      this.animateOnScroll();
    }, 100);
  }

  private animateOnScroll() {
    if (!this.isBrowser) return;
    
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    animateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add('animate');
      }
    });
  }

  onNavbarClick() {
    // Notify navigation service that manual navigation is in progress
    this.navigationService.setManualNavigationInProgress(true);
    // Close mobile menu when a link is clicked
    this.closeMobileMenu();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Prevent body scroll when menu is open
    if (this.isBrowser) {
      if (this.isMobileMenuOpen) {
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.classList.remove('mobile-menu-open');
      }
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    
    // Restore body scroll
    if (this.isBrowser) {
      document.body.classList.remove('mobile-menu-open');
    }
  }

  private updateProgressLine() {
    if (!this.isBrowser) return;
    
    // Update progress line based on active route
    setTimeout(() => {
      const activeLink = document.querySelector('.navbar-links a.active');
      const allLinks = document.querySelectorAll('.navbar-links a');
      
      if (activeLink && this.navbarElement) {
        const activeIndex = Array.from(allLinks).indexOf(activeLink);
        const progressHeight = ((activeIndex + 1) / allLinks.length) * 100;
        
        // Update the progress line position
        this.navbarElement.style.setProperty('--progress-height', `${progressHeight}%`);
        this.navbarElement.style.setProperty('--progress-top', `${(activeIndex / allLinks.length) * 100}%`);
      }
    }, 100);
  }

  private updatePageTitle(url: string) {
    // Map routes to page titles
    const routeTitleMap: { [key: string]: string } = {
      '/about': 'About',
      '/resume': 'Resume', 
      '/portfolio': 'Portfolio',
      '/contact': 'Contact'
    };

    // Get the current route
    const currentRoute = url.split('?')[0]; // Remove query params if any
    
    // Update the page title based on route
    if (routeTitleMap[currentRoute]) {
      this.currentPageTitle = routeTitleMap[currentRoute];
    } else {
      this.currentPageTitle = 'Dinh Pham'; // Default fallback
    }
  }

}
