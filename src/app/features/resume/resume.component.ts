import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NavigationService } from '../../shared/navigation.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent implements OnInit, AfterViewInit, OnDestroy {
  showModal = false;
  private hasNavigated = false;
  private isBrowser: boolean;
  private lastScrollTop = 0;
  allowNavigation = false; // Made public for template access
  private config: any;

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
    this.allowNavigation = false;
    // Delay để cho phép navigation sau configured delay để tránh navigation ngay lập tức
    setTimeout(() => {
      this.allowNavigation = true;
    }, this.config.navigationDelay);
  }

  ngOnDestroy(): void {
    this.hasNavigated = false;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isBrowser) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    
    // Nếu scroll về đầu trang thì chuyển về about
    if (this.navigationService.shouldNavigate(
      scrollTop, 
      this.lastScrollTop, 
      this.allowNavigation, 
      this.hasNavigated, 
      true
    )) {
      this.hasNavigated = true;
      this.router.navigate(['/about']).then(() => {
        window.scrollTo(0, 0);
      });
    }
    // Nếu scroll gần đến cuối trang thì chuyển sang portfolio
    else if (this.navigationService.shouldNavigate(
      scrollTop, 
      this.lastScrollTop, 
      this.allowNavigation, 
      this.hasNavigated, 
      false,
      documentHeight,
      windowHeight
    )) {
      this.hasNavigated = true;
      this.router.navigate(['/portfolio']).then(() => {
        window.scrollTo(0, 0);
      });
    }
    
    this.lastScrollTop = scrollTop;
  }

  showCertificateImage(): void {
    this.showModal = true;
  }

  closeCertificateImage(): void {
    this.showModal = false;
  }

  ngAfterViewInit(): void {
    // Initialize scroll animations only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  private initScrollAnimations(): void {
    // Check if IntersectionObserver is available (browser environment)
    if (typeof IntersectionObserver !== 'undefined') {
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
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      animatedElements.forEach(el => observer.observe(el));
    }
  }
}
