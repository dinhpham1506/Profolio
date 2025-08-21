import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hire-me-circle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hire-me-circle.component.html',
  styleUrl: './hire-me-circle.component.scss'
})
export class HireMeCircleComponent implements OnInit {
  isExpanded = false;
  private isBrowser: boolean;
  isAnimating = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      // Close expanded menu when clicking outside
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.hire-me-circle')) {
          this.isExpanded = false;
        }
      });
    }
  }

  toggleMenu() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.isExpanded = !this.isExpanded;
    
    // Reset animation flag after animation completes
    setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }

  navigateToContact() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.isExpanded = false;
    
    // Navigate after animation
    setTimeout(() => {
      this.router.navigate(['/contact']);
      this.isAnimating = false;
    }, 300);
  }

  downloadCV() {
    if (this.isAnimating || !this.isBrowser) return;
    
    this.isAnimating = true;
    this.isExpanded = false;
    
    // Download after animation
    setTimeout(() => {
      try {
        const link = document.createElement('a');
        link.href = '/assets/certificates/cv.pdf'; // Updated path
        link.download = 'Dinh_Pham_CV.pdf';
        link.click();
      } catch (error) {
        console.error('Error downloading CV:', error);
        // Fallback: open in new tab
        window.open('/assets/certificates/cv.pdf', '_blank');
      }
      this.isAnimating = false;
    }, 300);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.isExpanded = false;
  }
}