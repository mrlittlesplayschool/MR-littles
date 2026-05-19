import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-enquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enquiries.html',
  styleUrl: './enquiries.scss'
})
export class EnquiriesComponent implements OnInit {
  private api = inject(ApiService);

  enquiries    = signal<any[]>([]);
  loading      = signal(true);
  search       = '';
  filterStatus = '';
  selected: any = null;
  showForm     = false;

  form = {
    parent_name: '', phone: '', child_name: '',
    child_age: '', program: '', message: '', source: 'Website'
  };

  ngOnInit() { this.loadEnquiries(); }

  loadEnquiries() {
    this.loading.set(true);
    this.api.getEnquiries().subscribe({
      next: data => {
        const mapped = data.map(e => ({
          id:         e.id,
          parentName: e.parent_name,
          phone:      e.phone,
          childName:  e.child_name,
          childAge:   e.child_age,
          program:    e.program,
          message:    e.message,
          source:     e.source || 'Website',
          status:     e.status,
          date:       e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN') : '—'
        }));
        this.enquiries.set(mapped);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  get filtered() {
    return this.enquiries().filter(e => {
      const matchSearch = !this.search ||
        e.parentName?.toLowerCase().includes(this.search.toLowerCase()) ||
        e.childName?.toLowerCase().includes(this.search.toLowerCase());
      const matchStatus = !this.filterStatus || e.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  sourceIcon(source: string): string {
    switch (source) {
      case 'Website':   return '🌐';
      case 'WhatsApp':  return '💬';
      case 'Walk-in':   return '🚶';
      case 'Referral':  return '👥';
      default:          return '📋';
    }
  }

  statusClass(status: string): string {
    switch (status) {
      case 'New':          return 'badge-blue';
      case 'Contacted':    return 'badge-yellow';
      case 'Converted':    return 'badge-green';
      case 'Not Interested': return 'badge-red';
      default:             return 'badge-gray';
    }
  }

  updateStatus(id: number, status: string) {
    this.api.updateEnquiryStatus(id, status).subscribe({
      next: () => this.loadEnquiries(),
      error: () => alert('Failed to update status.')
    });
  }

  addEnquiry() {
    this.api.createEnquiry(this.form).subscribe({
      next: () => {
        this.showForm = false;
        this.form = { parent_name:'', phone:'', child_name:'', child_age:'', program:'', message:'', source:'Website' };
        this.loadEnquiries();
      },
      error: err => alert(err?.error?.error || 'Failed to save enquiry.')
    });
  }

  deleteEnquiry(id: number) {
    if (!confirm('Delete this enquiry?')) return;
    this.api.deleteEnquiry(id).subscribe({
      next: () => this.loadEnquiries(),
      error: () => alert('Failed to delete.')
    });
  }

  get newCount()       { return this.enquiries().filter(e => e.status === 'New').length; }
  get contactedCount() { return this.enquiries().filter(e => e.status === 'Contacted').length; }
  get convertedCount() { return this.enquiries().filter(e => e.status === 'Converted').length; }
}