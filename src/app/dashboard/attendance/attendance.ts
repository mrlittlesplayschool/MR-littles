import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DatepickerComponent } from '../../shared/datepicker/Datepicker.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule,DatepickerComponent],
  templateUrl: './attendance.html',
  styleUrl: './attendance.scss'
})
export class AttendanceComponent implements OnInit {
  private api = inject(ApiService);

  // students array with status + avatar built in — matches HTML exactly
  allStudents: any[] = []; // Store all students
  students: any[] = [];     // Filtered students for display
  loading   = signal(true);
  saved     = false;

  selectedDate    = new Date().toISOString().split('T')[0];
  selectedProgram = 'All';
  programs        = ['All', 'Playgroup', 'Nursery', 'Junior KG', 'Senior KG'];

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading.set(true);
    this.api.getStudents().subscribe({
      next: allStudents => {
        // Build student list with avatar and default status
        const mapped = allStudents.map(s => ({
          ...s,
          avatar: s.name?.charAt(0)?.toUpperCase() || '?',
          status: ''
        }));

        // Load existing attendance for selected date
        this.api.getAttendance(this.selectedDate).subscribe({
          next: records => {
            records.forEach(r => {
              const found = mapped.find(s => s.id === r.student_id);
              if (found) found.status = r.status;
            });
            this.allStudents = mapped; // Store all students
            this.applyFilter(); // Apply current filter
            this.loading.set(false);
          },
          error: () => {
            this.allStudents = mapped; // Store all students
            this.applyFilter(); // Apply current filter
            this.loading.set(false);
          }
        });
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilter() {
    if (this.selectedProgram === 'All') {
      this.students = [...this.allStudents];
    } else {
      this.students = this.allStudents.filter(s => s.program === this.selectedProgram);
    }
  }

  onDateChange() { this.loadData(); }

  // Called when program tab clicked
  selectProgram(p: string) {
    this.selectedProgram = p;
    this.applyFilter(); // Just filter, don't reload
  }

  setStatus(studentId: number, status: string) {
    const s = this.students.find(st => st.id === studentId);
    if (s) s.status = status;
  }

  markAll(status: string) {
    this.students.forEach(s => s.status = status);
  }

  statusColor(status: string): string {
    switch (status) {
      case 'present': return '#2ecc71';
      case 'absent':  return '#e74c3c';
      case 'late':    return '#f39c12';
      default:        return '#94a3b8';
    }
  }

  saveAttendance() {
    // Validate that at least one student has a status
    const hasStatus = this.students.some(s => s.status);
    if (!hasStatus) {
      alert('Please mark attendance for at least one student.');
      return;
    }

    const records = this.students.map(s => ({
      student_id: s.id,
      status: s.status || 'absent',
      remark: ''
    }));

    this.api.saveAttendance(this.selectedDate, records).subscribe({
      next: () => {
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      },
      error: err => {
        console.error('Save attendance error:', err);
        const errorMsg = err?.error?.error || err?.error?.message || 'Failed to save attendance.';
        alert(errorMsg);
      }
    });
  }

  get presentCount() { return this.students.filter(s => s.status === 'present').length; }
  get absentCount()  { return this.students.filter(s => s.status === 'absent').length; }
  get lateCount()    { return this.students.filter(s => s.status === 'late').length; }
}