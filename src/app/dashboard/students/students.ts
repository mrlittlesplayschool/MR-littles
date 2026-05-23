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
    // Validate required fields
    const name = this.newStudent.name?.trim();
    if (!name) {
      alert('❌ Student name is required.');
      return;
    }
    
    if (name.length < 2) {
      alert('❌ Student name must be at least 2 characters.');
      return;
    }
    
    if (!this.newStudent.program) {
      alert('❌ Please select a program.');
      return;
    }
    
    // Validate phone number
    const phone = this.newStudent.phone?.trim();
    if (phone) {
      // Remove spaces and special characters for validation
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      
      // Check if it's a valid Indian phone number (10 digits)
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        alert('❌ Please enter a valid 10-digit Indian phone number starting with 6-9.');
        return;
      }
    }
    
    // Validate parent name
    const parentName = this.newStudent.parentName?.trim();
    if (parentName && parentName.length < 2) {
      alert('❌ Parent name must be at least 2 characters.');
      return;
    }
    
    // Validate date of birth
    if (this.newStudent.dob) {
      const dobDate = new Date(this.newStudent.dob);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 10); // Max 10 years old
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 1); // Min 1 year old
      
      if (dobDate > today) {
        alert('❌ Date of birth cannot be in the future.');
        return;
      }
      
      if (dobDate < minDate) {
        alert('❌ Student age cannot be more than 10 years.');
        return;
      }
      
      if (dobDate > maxDate) {
        alert('❌ Student must be at least 1 year old.');
        return;
      }
    }

    // Map camelCase form → snake_case API
    const payload = {
      name:        name,
      program:     this.newStudent.program,
      dob:         this.newStudent.dob || null,
      parent_name: parentName || '',
      phone:       phone || '',
      address:     this.newStudent.address?.trim() || '',
      fee_plan:    this.newStudent.feePlan || 'Monthly'
    };

    const req = this.editId
      ? this.api.updateStudent(this.editId, payload)
      : this.api.createStudent(payload);

    req.subscribe({
      next: () => {
        alert(this.editId ? '✅ Student updated successfully!' : '✅ Student added successfully!');
        this.closeForm();
        this.loadStudents();
      },
      error: err => {
        console.error('Save error:', err);
        let errorMsg = 'Failed to save student.';
        
        // Parse error message
        if (err?.error?.error) {
          errorMsg = err.error.error;
        } else if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        }
        
        // Check for specific errors
        if (errorMsg.includes('FEE_STRUCTURE_NOT_FOUND') || errorMsg.includes('Fee structure not configured')) {
          alert('❌ Fee structure not configured!\n\nPlease configure fee structures for this program and fee plan in the Fee Structure Manager before adding students.');
        } else {
          alert('❌ ' + errorMsg);
        }
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