import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-teacher-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teacher-login.html',
  styleUrl: './teacher-login.scss'
})
export class TeacherLoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email    = '';
  password = '';
  error    = signal('');
  loading  = signal(false);

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Please enter email and password.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.loginTeacher(this.email, this.password);
      // Navigation handled by auth.service
    } catch (err: any) {
      const msg = err?.error?.error || err?.message || 'Login failed. Please try again.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}