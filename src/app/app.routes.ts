import { Routes } from '@angular/router';
import { AboutComponent } from './features/about/about.component';
import { PortfolioComponent } from './features/portfolio/portfolio.component';
import { ContactComponent } from './features/contact/contact.component';
import { ResumeComponent } from './features/resume/resume.component';

export const routes: Routes = [
  { path: '', redirectTo: 'about', pathMatch: 'full' }, // trang mặc định
  { path: 'about', component: AboutComponent },
  { path: 'resume', component: ResumeComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { path: 'contact', component: ContactComponent }
];
