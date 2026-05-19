import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  isScrolled  = false;
  menuOpen    = false;
  activeSection: string = 'hero';

  constructor(private router: Router) {
    // After navigation ends, re-check scroll position for active state
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updateActiveSection());
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 30;
    this.updateActiveSection();
  }

  /** Smooth-scroll to a section by ID. Closes mobile menu. */
  scrollTo(sectionId: string): void {
    this.closeMenu();

    // If not on home page, navigate there first then scroll
    if (!this.router.url.startsWith('/') || this.router.url.length > 1) {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.doScroll(sectionId), 100);
      });
    } else {
      this.doScroll(sectionId);
    }
  }

  private doScroll(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const navHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '76'
    );
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /** Highlight active nav link based on visible section.
   *  Intermediate sections (why-us, testimonials) map back to 'programs'.
   */
  private updateActiveSection(): void {
    // All page sections in order, mapped to their nav highlight target
    const sectionMap: { id: string; navTarget: string }[] = [
      { id: 'hero',          navTarget: 'hero'      },
      { id: 'our-story',     navTarget: 'our-story' },
      { id: 'programs',      navTarget: 'programs'  },
      { id: 'why-us',        navTarget: 'programs'  },  // still highlights Programs
      { id: 'testimonials',  navTarget: 'programs'  },  // still highlights Programs
      { id: 'contact',       navTarget: 'contact'   },
    ];

    const offset = 110; // px below nav to trigger section change
    let current = 'hero';

    for (const { id, navTarget } of sectionMap) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        current = navTarget;
      }
    }

    this.activeSection = current;
  }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu():  void { this.menuOpen = false; }
}