import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './owner-layout.html',
  styleUrl:    './owner-layout.scss'
})
export class OwnerLayoutComponent {

  private auth  = inject(AuthService);
  public  router = inject(Router);

  sidebarOpen = signal(false);

  user    = this.auth.getUser();
  isOwner = this.auth.getUserRole() === 'owner';

  navItems = [
    { icon: '⬡',  label: 'Overview',   route: '/dashboard/overview'                  },
    { icon: '👦',  label: 'Students',   route: '/dashboard/students'                  },
    { icon: '✅',  label: 'Attendance', route: '/dashboard/attendance'                },
    { icon: '💰',  label: 'Fees',       route: '/dashboard/fees'                      },
    { icon: '⚙️',  label: 'Fee Structure', route: '/dashboard/fee-structure', ownerOnly: true },
    { icon: '👩‍🏫', label: 'Teachers',   route: '/dashboard/teachers', ownerOnly: true },
    { icon: '📋',  label: 'Enquiries',  route: '/dashboard/enquiries'                 },
  ];

  get visibleNavItems() {
    return this.navItems.filter(i => !i['ownerOnly'] || this.isOwner);
  }

  get portalLabel() { return this.isOwner ? 'Owner Portal' : 'Teacher Portal'; }
  get accentColor() { return this.isOwner ? 'var(--sun)' : 'var(--sky)'; }
  get logoGradient() {
    return this.isOwner
      ? 'linear-gradient(135deg,var(--sun),var(--rose))'
      : 'linear-gradient(135deg,var(--sky),var(--leaf))';
  }

  get today(): string {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  toggleSidebar() { 
    this.sidebarOpen.update(v => !v);
    // Prevent body scroll on mobile when sidebar is open
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.sidebarOpen() ? 'hidden' : '';
    }
  }
  
  closeSidebar()  { 
    this.sidebarOpen.set(false);
    // Re-enable body scroll
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  logout() {
  this.auth.logout();
  this.router.navigate(['/']);
}
}