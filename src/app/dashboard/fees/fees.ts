import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fees.html',
  styleUrl: './fees.scss'
})
export class FeesComponent implements OnInit {
  private api = inject(ApiService);

  fees              = signal<any[]>([]);
  loading           = signal(true);
  search            = '';
  filterStatus      = '';
  filterProgram     = '';
  showPaymentModal  = false;
  showAddFeeModal   = false;
  selectedFee: any  = null;
  payAmount         = 0;
  paymentMethod     = 'Cash';
  paymentNotes      = '';

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading.set(true);
    console.log('📊 Loading fees data...');
    
    this.api.getFees().subscribe({
      next: data => {
        console.log('✅ Fees data received:', data);
        
        // Map API fields to what HTML expects
        const mapped = data.map(f => ({
          id:          f.id,
          studentId:   f.student_id,
          studentName: f.student_name || 'Unknown Student',
          program:     f.program || 'N/A',
          parentName:  f.parent_name || 'N/A',
          phone:       f.phone || '',
          feePlan:     f.fee_plan || 'Monthly',
          totalFee:    parseFloat(f.total_fee || 0),
          paidAmount:  parseFloat(f.paid_amount || 0),
          dueDate:     f.due_date ? new Date(f.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          paidDate:    f.paid_date ? new Date(f.paid_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
          status:      f.status || 'Pending',
          month:       f.month || this.getCurrentMonth(),
          createdAt:   f.created_at
        }));
        
        console.log('📦 Mapped fees:', mapped);
        this.fees.set(mapped);
        this.loading.set(false);
      },
      error: err => {
        console.error('❌ Error loading fees:', err);
        this.loading.set(false);
      }
    });
  }

  getCurrentMonth(): string {
    return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  get filtered() {
    return this.fees().filter(f => {
      const matchSearch = !this.search ||
        f.studentName?.toLowerCase().includes(this.search.toLowerCase()) ||
        f.parentName?.toLowerCase().includes(this.search.toLowerCase()) ||
        f.phone?.includes(this.search);
      const matchStatus = !this.filterStatus || f.status === this.filterStatus;
      const matchProgram = !this.filterProgram || f.program === this.filterProgram;
      return matchSearch && matchStatus && matchProgram;
    });
  }

  applyFilters() {
    // Filters are applied automatically through the filtered getter
  }

  fmt(amount: number): string {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  }

  statusClass(status: string): string {
    switch (status) {
      case 'Paid':    return 'badge-green';
      case 'Partial': return 'badge-yellow';
      case 'Overdue': return 'badge-red';
      case 'Pending': return 'badge-blue';
      default:        return 'badge-gray';
    }
  }

  getAvatarColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, var(--sun), var(--rose))',
      'linear-gradient(135deg, var(--sky), var(--leaf))',
      'linear-gradient(135deg, var(--rose), var(--sun))',
      'linear-gradient(135deg, var(--leaf), var(--sky))',
    ];
    return colors[index % colors.length];
  }

  getProgramColor(program: string): string {
    const colors: Record<string, string> = {
      'Playgroup':  'rgba(232, 130, 12, 0.15)',
      'Nursery':    'rgba(224, 70, 124, 0.15)',
      'Junior KG':  'rgba(26, 143, 209, 0.15)',
      'Senior KG':  'rgba(34, 160, 90, 0.15)',
    };
    return colors[program] || 'rgba(148, 163, 184, 0.15)';
  }

  isOverdue(dueDate: string): boolean {
    if (dueDate === '—') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  }

  openPayment(fee: any) {
    this.selectedFee = fee;
    this.payAmount   = fee.totalFee - fee.paidAmount;
    this.paymentMethod = 'Cash';
    this.paymentNotes = '';
    this.showPaymentModal = true;
  }

  collectPayment() {
    if (!this.selectedFee || !this.payAmount) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const maxAmount = this.selectedFee.totalFee - this.selectedFee.paidAmount;
    if (this.payAmount <= 0) {
      alert('Payment amount must be greater than zero.');
      return;
    }
    if (this.payAmount > maxAmount) {
      alert(`Payment amount cannot exceed the balance due (${this.fmt(maxAmount)})`);
      return;
    }

    console.log('💳 Collecting payment:', {
      feeId: this.selectedFee.id,
      amount: this.payAmount,
      method: this.paymentMethod,
      notes: this.paymentNotes
    });

    this.api.collectFee(this.selectedFee.id, this.payAmount).subscribe({
      next: () => { 
        console.log('✅ Payment collected successfully');
        this.showPaymentModal = false; 
        this.loadData(); 
      },
      error: err => {
        console.error('❌ Collect fee error:', err);
        const errorMsg = err?.error?.error || err?.error?.message || 'Failed to collect payment.';
        alert(errorMsg);
      }
    });
  }

  viewDetails(fee: any) {
    console.log('👁️ View details:', fee);
    alert(`Fee Details:\n\nStudent: ${fee.studentName}\nProgram: ${fee.program}\nTotal: ${this.fmt(fee.totalFee)}\nPaid: ${this.fmt(fee.paidAmount)}\nBalance: ${this.fmt(fee.totalFee - fee.paidAmount)}\nStatus: ${fee.status}`);
  }

  sendReminder(fee: any) {
    console.log('📧 Send reminder to:', fee);
    alert(`Reminder will be sent to ${fee.parentName} for ${fee.studentName}'s pending fee of ${this.fmt(fee.totalFee - fee.paidAmount)}`);
  }

  exportToCSV() {
    console.log('📊 Exporting to CSV...');
    const csv = this.generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fees-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  generateCSV(): string {
    const headers = ['Student Name', 'Program', 'Parent Name', 'Total Fee', 'Paid Amount', 'Balance', 'Due Date', 'Status', 'Month'];
    const rows = this.filtered.map(f => [
      f.studentName,
      f.program,
      f.parentName,
      f.totalFee,
      f.paidAmount,
      f.totalFee - f.paidAmount,
      f.dueDate,
      f.status,
      f.month
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  get totalFees()      { return this.fees().reduce((s, f) => s + f.totalFee, 0); }
  get totalCollected() { return this.fees().reduce((s, f) => s + f.paidAmount, 0); }
  get totalPending()   { return this.totalFees - this.totalCollected; }
  get paidCount()      { return this.fees().filter(f => f.status === 'Paid').length; }
  get pendingCount()   { return this.fees().filter(f => f.status === 'Pending').length; }
  get partialCount()   { return this.fees().filter(f => f.status === 'Partial').length; }
  get overdueCount()   { return this.fees().filter(f => f.status === 'Overdue').length; }
}