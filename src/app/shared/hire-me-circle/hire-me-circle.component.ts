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
    this.isExpanded = !this.isExpanded;
  }

  navigateToContact() {
    this.router.navigate(['/contact']);
    this.isExpanded = false;
  }

  downloadCV() {
    if (this.isBrowser) {
      const link = document.createElement('a');
      link.href = '/assets/cv.pdf';
      link.download = 'Dinh_Pham_CV.pdf';
      link.click();
    }
    this.isExpanded = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    this.isExpanded = false;
  }
}