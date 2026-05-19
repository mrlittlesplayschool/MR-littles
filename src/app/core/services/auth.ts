import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id:    number;
  name:  string;
  email: string;
  role:  'owner' | 'teacher';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  // ── Token helpers ──────────────────────────────
  private saveSession(token: string, user: User) {
    localStorage.setItem('ml_token', token);
    localStorage.setItem('ml_auth_user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('ml_token');
  }

  getUser(): User | null {
    const raw = localStorage.getItem('ml_auth_user');
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  // ── Login Owner ────────────────────────────────
  async loginOwner(email: string, password: string): Promise<void> {
    const res: any = await this.http
      .post(`${this.apiUrl}/auth/login`, { email, password })
      .toPromise();

    if (res.user.role !== 'owner') {
      throw new Error('Not an owner account.');
    }

    this.saveSession(res.token, res.user);
    this.router.navigate(['/dashboard/overview']);
  }

  // ── Login Teacher ──────────────────────────────
  async loginTeacher(email: string, password: string): Promise<void> {
    const res: any = await this.http
      .post(`${this.apiUrl}/auth/login`, { email, password })
      .toPromise();

    if (res.user.role !== 'teacher') {
      throw new Error('Not a teacher account.');
    }

    this.saveSession(res.token, res.user);
    this.router.navigate(['/dashboard/overview']);
  }

  // ── Logout ─────────────────────────────────────
  logout(): void {
    localStorage.removeItem('ml_token');
    localStorage.removeItem('ml_auth_user');
    // Navigation handled by the calling component
  }
}