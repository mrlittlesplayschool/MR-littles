import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  goToOwnerLogin(): void {
    this.router.navigate(['/owner-login']);
  }

  goToTeacherLogin(): void {
    this.router.navigate(['/teacher-login']);
  }
}