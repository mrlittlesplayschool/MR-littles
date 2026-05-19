import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DatepickerComponent } from '../../shared/datepicker/Datepicker.component';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, DatepickerComponent],
  templateUrl: './students.html',
  styleUrl: './students.scss'
})
export class StudentsComponent implements OnInit {
  private api = inject(ApiService);

  students  = signal<any[]>([]);
  loading   = signal(true);
  showForm  = false;
  editMode  = false;
  editId: number | null = null;
  search    = '';
  filterPrg = '';

  // Matches HTML exactly: newStudent.name, newStudent.parentName etc.
  newStudent = {
    name:       '',
    program:    '',
    dob:        '',
    parentName: '',
    phone:      '',
    address:    '',
    feePlan:    'Monthly'
  };

  programColors: Record<string, string> = {
    'Playgroup':  '#f093fb',
    'Nursery':    '#4facfe',
    'Junior KG':  '#43e97b',
    'Senior KG':  '#fa709a',
    'LKG':        '#43e97b',
    'UKG':        '#fa709a',
  };

  ngOnInit() { this.loadStudents(); }

  loadStudents() {
    this.loading.set(true);
    this.api.getStudents().subscribe({
      next: data => {
        const mapped = data.map(s => ({
          id:         s.id,
          name:       s.name,
          program:    s.program || '',
          dob:        s.dob || '',
          parentName: s.parent_name || '',
          phone:      s.phone || '',
          address:    s.address || '',
          feePlan:    s.fee_plan || 'Monthly',
          feeStatus:  s.fee_status || 'Pending',
          joinDate:   s.join_date
            ? new Date(s.join_date).toLocaleDateString('en-IN')
            : new Date(s.created_at).toLocaleDateString('en-IN'),
          avatar:     s.name?.charAt(0)?.toUpperCase() || '?',
          age:        s.dob ? this.calcAge(s.dob) : '—'
        }));
        this.students.set(mapped);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  calcAge(dob: string): string {
    const birth  = new Date(dob);
    const today  = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12
      + (today.getMonth() - birth.getMonth());
    if (months < 12) return `${months}m`;
    return `${Math.floor(months / 12)}y ${months % 12}m`;
  }

  get filtered() {
    return this.students().filter(s => {
      const matchSearch = !this.search ||
        s.name?.toLowerCase().includes(this.search.toLowerCase()) ||
        s.parentName?.toLowerCase().includes(this.search.toLowerCase());
      const matchPrg = !this.filterPrg || s.program === this.filterPrg;
      return matchSearch && matchPrg;
    });
  }

  feeClass(status: string): string {
    switch (status) {
      case 'Paid':    return 'badge-green';
      case 'Partial': return 'badge-yellow';
      case 'Overdue': return 'badge-red';
      default:        return 'badge-gray';
    }
  }

  openAdd() {
    this.editMode  = false;
    this.editId    = null;
    this.newStudent = { name:'', program:'', dob:'', parentName:'', phone:'', address:'', feePlan:'Monthly' };
    this.showForm  = true;
  }

  openEdit(s: any) {
    this.editMode  = true;
    this.editId    = s.id;
    this.newStudent = {
      name:       s.name,
      program:    s.program,
      dob:        s.dob ? s.dob.split('T')[0] : '',
      parentName: s.parentName,
      phone:      s.phone,
      address:    s.address,
      feePlan:    s.feePlan || 'Monthly'
    };
    this.showForm = true;
  }

  closeForm() { this.showForm = false; }

  saveStudent() {
    // Trim and validate
    const name = this.newStudent.name?.trim();
    if (!name) {
      alert('Student name is required.');
      return;
    }
    if (!this.newStudent.program) {
      alert('Please select a program.');
      return;
    }

    // Map camelCase form → snake_case API
    const payload = {
      name:        name,
      program:     this.newStudent.program,
      dob:         this.newStudent.dob || null,
      parent_name: this.newStudent.parentName?.trim() || '',
      phone:       this.newStudent.phone?.trim() || '',
      address:     this.newStudent.address?.trim() || '',
      fee_plan:    this.newStudent.feePlan || 'Monthly'
    };

    const req = this.editId
      ? this.api.updateStudent(this.editId, payload)
      : this.api.createStudent(payload);

    req.subscribe({
      next: () => {
        this.closeForm();
        this.loadStudents();
      },
      error: err => {
        console.error('Save error:', err);
        const errorMsg = err?.error?.error || err?.error?.message || 'Failed to save student. Check console for details.';
        alert(errorMsg);
      }
    });
  }

  deleteStudent(id: number) {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    this.api.deleteStudent(id).subscribe({
      next: () => this.loadStudents(),
      error: () => alert('Failed to delete student.')
    });
  }
}