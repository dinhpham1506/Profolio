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
  private scrollThreshold = 100; // Scroll 100px để chuyển trang
  private hasNavigated = false;
  private isBrowser: boolean;
  private lastScrollTop = 0;
  allowNavigation = false; // Made public for template access

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private navigationService: NavigationService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.hasNavigated = false;
    this.allowNavigation = false;
    // Delay để cho phép navigation sau 1 giây để tránh navigation ngay lập tức
    setTimeout(() => {
      this.allowNavigation = true;
    }, 1000);
  }

  ngOnDestroy(): void {
    this.hasNavigated = false;
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    if (!this.isBrowser || this.hasNavigated || !this.allowNavigation) return;
    
    // Check if scroll navigation is enabled
    if (!this.navigationService.isScrollNavigationEnabled()) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
    
    // Nếu scroll về đầu trang thì chuyển về about (chỉ khi scroll lên từ vị trí cao và đã ở trên trang một lúc)
    if (scrollTop <= this.scrollThreshold && scrollTop < this.lastScrollTop && this.lastScrollTop > 200) {
      this.hasNavigated = true;
      this.router.navigate(['/about']).then(() => {
        window.scrollTo(0, 0);
      });
    }
    // Nếu scroll gần đến cuối trang thì chuyển sang portfolio
    else if (distanceFromBottom <= this.scrollThreshold) {
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
