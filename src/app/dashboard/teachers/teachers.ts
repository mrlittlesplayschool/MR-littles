import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.scss'
})
export class TeachersComponent implements OnInit {
  private api = inject(ApiService);

  teachers  = signal<any[]>([]);
  loading   = signal(true);
  showForm  = false;
  editMode  = false;
  editId: number | null = null;
  search    = '';

  // Password UI state
  showPassword        = false;
  showConfirmPassword = false;
  generatedPassword   = '';
  copyLabel           = '📋 Copy';
  toastMsg            = '';
  toastVisible        = false;
  toastType           = 'success';

  newTeacher = {
    name: '', role: 'Class Teacher', program: 'Nursery',
    salary: '', phone: '', email: '',
    password: '', confirmPassword: '',
    salary_month: ''
  };

  avatarColors = [
    'linear-gradient(135deg,#667eea,#764ba2)',
    'linear-gradient(135deg,#f093fb,#f5576c)',
    'linear-gradient(135deg,#4facfe,#00f2fe)',
    'linear-gradient(135deg,#43e97b,#38f9d7)',
    'linear-gradient(135deg,#fa709a,#fee140)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  ];

  ngOnInit() { this.loadTeachers(); }

  loadTeachers() {
    this.loading.set(true);
    this.api.getTeachers().subscribe({
      next: data => {
        const mapped = data.map(t => ({
          id:           t.id,
          user_id:      t.user_id,
          name:         t.name,
          email:        t.email,
          role:         t.role,
          program:      t.program,
          phone:        t.phone,
          salary:       parseFloat(t.salary || 0),
          salaryStatus: t.salary_status || 'Pending',
          salaryMonth:  t.salary_month,
          joinDate:     t.join_date ? new Date(t.join_date).toLocaleDateString('en-IN') : '—',
          avatar:       t.name?.charAt(0)?.toUpperCase() || '?'
        }));
        this.teachers.set(mapped);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get filtered() {
    const s = this.search.toLowerCase();
    if (!s) return this.teachers();
    return this.teachers().filter(t =>
      t.name?.toLowerCase().includes(s) ||
      t.role?.toLowerCase().includes(s)
    );
  }

  avColor(i: number): string {
    return this.avatarColors[i % this.avatarColors.length];
  }

  fmt(amount: number): string {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  }

  openAdd() {
    this.editMode = false;
    this.editId   = null;
    this.newTeacher = {
      name: '', role: 'Class Teacher', program: 'Nursery',
      salary: '', phone: '', email: '',
      password: '', confirmPassword: '',
      salary_month: ''
    };
    this.generatedPassword   = '';
    this.showPassword        = false;
    this.showConfirmPassword = false;
    this.showForm = true;
  }

  openEdit(t: any) {
    this.editMode = true;
    this.editId   = t.id;
    this.newTeacher = {
      name: t.name, role: t.role, program: t.program,
      salary: t.salary, phone: t.phone, email: t.email,
      password: '', confirmPassword: '',
      salary_month: t.salaryMonth || ''
    };
    this.generatedPassword   = '';
    this.showPassword        = false;
    this.showConfirmPassword = false;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editMode = false;
    this.editId   = null;
  }

  // ── Password helpers ───────────────────────────────────
  get passwordStrength(): { label: string; cls: string; pct: number } {
    const pw = this.newTeacher.password;
    if (!pw) return { label: '', cls: '', pct: 0 };
    let score = 0;
    if (pw.length >= 8)           score++;
    if (pw.length >= 12)          score++;
    if (/[A-Z]/.test(pw))         score++;
    if (/[0-9]/.test(pw))         score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak',   cls: 'pw-weak',   pct: 20 };
    if (score <= 2) return { label: 'Fair',   cls: 'pw-fair',   pct: 45 };
    if (score <= 3) return { label: 'Good',   cls: 'pw-good',   pct: 72 };
    return             { label: 'Strong', cls: 'pw-strong', pct: 100 };
  }

  get passwordMismatch(): boolean {
    return !!(this.newTeacher.confirmPassword && this.newTeacher.password !== this.newTeacher.confirmPassword);
  }

  generatePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pw = '';
    for (let i = 0; i < 14; i++) {
      pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.generatedPassword          = pw;
    this.newTeacher.password        = pw;
    this.newTeacher.confirmPassword = pw;
    this.showPassword        = true;
    this.showConfirmPassword = true;
  }

  copyPassword() {
    if (!this.generatedPassword) return;
    navigator.clipboard.writeText(this.generatedPassword).then(() => {
      this.copyLabel = '✅ Copied!';
      setTimeout(() => this.copyLabel = '📋 Copy', 2000);
    });
  }

  // ── Save (create or update) ────────────────────────────
  saveTeacher() {
    const { name, email, password, confirmPassword } = this.newTeacher;

    if (!name || !email) {
      this.showToast('Name and email are required.', 'error');
      return;
    }
    if (!this.editMode && !password) {
      this.showToast('Please set a password for this teacher.', 'error');
      return;
    }
    if (password && password !== confirmPassword) {
      this.showToast('Passwords do not match.', 'error');
      return;
    }

    const payload: any = {
      name:         name,
      email:        email,
      role:         this.newTeacher.role,
      program:      this.newTeacher.program,
      phone:        this.newTeacher.phone,
      salary:       this.newTeacher.salary,
      salary_month: this.newTeacher.salary_month
    };
    if (password) payload.password = password;

    this.api.createTeacher(payload).subscribe({
      next: () => {
        const verb = this.editMode ? 'updated' : 'created';
        this.showToast(`${name}'s account ${verb} successfully.`, 'success');
        this.closeForm();
        this.loadTeachers();
      },
      error: err => this.showToast(err?.error?.error || 'Failed to save teacher.', 'error')
    });
  }

  markSalaryPaid(id: number) {
    const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    this.api.updateSalary(id, month).subscribe({
      next: () => this.loadTeachers(),
      error: () => this.showToast('Failed to update salary.', 'error')
    });
  }

  deleteTeacher(id: number) {
    if (!confirm('Delete this teacher? Their login will also be removed.')) return;
    this.api.deleteTeacher(id).subscribe({
      next: () => { this.showToast('Teacher removed.', 'success'); this.loadTeachers(); },
      error: () => this.showToast('Failed to delete teacher.', 'error')
    });
  }

  get totalSalary()   { return this.teachers().reduce((s, t) => s + t.salary, 0); }
  get pendingSalary() { return this.teachers().filter(t => t.salaryStatus === 'Pending').reduce((s, t) => s + t.salary, 0); }

  // ── Toast ──────────────────────────────────────────────
  showToast(msg: string, type: 'success' | 'error') {
    this.toastMsg     = msg;
    this.toastType    = type;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3200);
  }
}