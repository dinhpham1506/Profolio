import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NavigationService } from '../../shared/navigation.service';

interface ProjectTechnology {
  name: string;
  icon: string;
}

interface Project {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  image: string;
  description: string[];
  technologies: ProjectTechnology[];
  liveUrl?: string;
  githubUrl?: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss'
})
export class PortfolioComponent implements OnInit, AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();
  previousPageName = 'Resume';
  nextPageName = 'Contact';
  isModalOpen = false;
  selectedProject: Project | null = null;
  private scrollThreshold = 100; // Increased threshold to give users more time to view projects
  allowScrollNavigation = false; // Made public for template access
  private navigationTimeout: any;
  private hasNavigated = false;
  private isBrowser: boolean;
  private lastScrollTop = 0;

  projects: { [key: string]: Project } = {
    foodshare: {
      id: 'foodshare',
      title: 'FoodShare - Food Discovery Platform',
      subtitle: 'Full-stack Developer',
      date: 'Personal Project',
      image: '/assets/img/foodshare.png',
      description: [
        'A platform for sharing and discovering delicious food locations',
        'Integrated AI to suggest dishes based on user preferences',
        'Google Maps integration for location-based food discovery',
        'Real-time chat and video sharing features',
        'Cross-platform mobile and web application'
      ],
      technologies: [
        { name: 'Spring Boot', icon: 'https://img.icons8.com/color/48/spring-logo.png' },
        { name: 'React', icon: 'https://img.icons8.com/color/48/react-native.png' },
        { name: 'React Native', icon: 'https://img.icons8.com/color/48/react-native.png' },
        { name: 'MySQL', icon: 'https://img.icons8.com/color/48/mysql-logo.png' },
        { name: 'OpenAI', icon: 'https://img.icons8.com/color/48/chatgpt.png' },
        { name: 'Google Maps', icon: 'https://img.icons8.com/color/48/google-maps.png' }
      ],
      liveUrl: 'https://foodshare-app.vercel.app',
      githubUrl: 'https://github.com/dinhpham1506/foodshare'
    },
    reprotrack: {
      id: 'reprotrack',
      title: 'ReproTrack - Infertility Treatment Management System',
      subtitle: 'Backend Java Developer',
      date: 'Team Project',
      image: '/assets/img/repotrack.png',
      description: [
        'Healthcare management system for infertility treatment',
        'Secure patient data management with role-based access',
        'AI chatbot for patient support and guidance',
        'RESTful API design following SOLID principles',
        'Real-time communication features'
      ],
      technologies: [
        { name: 'Java', icon: 'https://img.icons8.com/color/48/java-coffee-cup-logo.png' },
        { name: 'Spring Boot', icon: 'https://img.icons8.com/color/48/spring-logo.png' },
        { name: 'Spring Security', icon: 'https://img.icons8.com/color/48/spring-logo.png' },
        { name: 'MySQL', icon: 'https://img.icons8.com/color/48/mysql-logo.png' },
        { name: 'OAuth2', icon: 'https://img.icons8.com/color/48/security-checked.png' },
        { name: 'AI Chatbot', icon: 'https://img.icons8.com/color/48/chatgpt.png' }
      ],
      liveUrl: 'https://reprotrack-demo.vercel.app',
      githubUrl: 'https://github.com/dinhpham1506/reprotrack'
    }
  };

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
    
    // Allow scroll navigation after 3 seconds to give users time to view projects
    this.navigationTimeout = setTimeout(() => {
      this.allowScrollNavigation = true;
    }, 3000);
  }

  ngAfterViewInit(): void {
    // Initialize scroll animations only in browser
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollAnimations();
    }
  }

  ngOnDestroy(): void {
    this.hasNavigated = false;
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
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
    
    // Navigate to Resume when scrolling up near the top
    if (scrollTop <= this.scrollThreshold && scrollTop < this.lastScrollTop && this.lastScrollTop > 200) {
      this.hasNavigated = true;
      this.router.navigate(['/resume']).then(() => {
        // Scroll to bottom of resume page to maintain flow
        setTimeout(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
        }, 100);
      });
    }
    // Navigate to Contact when scrolling down near the bottom
    else if (scrollTop + windowHeight >= documentHeight - this.scrollThreshold && scrollTop > this.lastScrollTop) {
      this.hasNavigated = true;
      this.router.navigate(['/contact']).then(() => {
        window.scrollTo(0, 0);
      });
    }
    
    this.lastScrollTop = scrollTop;
  }

  openProjectModal(projectId: string): void {
    this.selectedProject = this.projects[projectId];
    this.isModalOpen = true;
    
    // Prevent body scroll when modal is open
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedProject = null;
    
    // Restore body scroll
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  openProject(url: string): void {
    if (isPlatformBrowser(this.platformId)) {
      window.open(url, '_blank');
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
