import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

interface FeeStructure {
  id?: number;
  program: string;
  plan_type: string;
  amount: number;
  discount_percentage: number;
  academic_year: string;
  is_active: boolean;
}

@Component({
  selector: 'app-fee-structure',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fee-structure.html',
  styleUrl: './fee-structure.scss'
})
export class FeeStructureComponent implements OnInit {
  private api = inject(ApiService);

  feeStructures = signal<FeeStructure[]>([]);
  loading = signal(true);
  saving = signal(false);
  
  programs = ['Playgroup', 'Nursery', 'Junior KG', 'Senior KG'];
  planTypes = ['Monthly', '6 Months', 'Yearly'];
  currentYear = this.getCurrentAcademicYear();
  
  selectedProgram = 'Playgroup';
  
  // Form data for each plan type
  planData: Record<string, { amount: number; discount: number }> = {
    'Monthly': { amount: 0, discount: 0 },
    '6 Months': { amount: 0, discount: 0 },
    'Yearly': { amount: 0, discount: 0 }
  };

  ngOnInit() {
    this.loadFeeStructures();
  }

  getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed (0 = January)
    
    // If before April (month < 3), we're in the previous academic year
    if (month < 3) {
      return `${year - 1}-${year.toString().slice(2)}`;
    }
    return `${year}-${(year + 1).toString().slice(2)}`;
  }

  loadFeeStructures() {
    this.loading.set(true);
    this.api.getFeeStructures(this.currentYear).subscribe({
      next: (data) => {
        this.feeStructures.set(data);
        this.loadProgramData();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading fee structures:', err);
        this.loading.set(false);
      }
    });
  }

  loadProgramData() {
    const structures = this.feeStructures().filter(
      f => f.program === this.selectedProgram && f.academic_year === this.currentYear
    );
    
    structures.forEach(s => {
      if (this.planData[s.plan_type]) {
        this.planData[s.plan_type] = {
          amount: s.amount,
          discount: s.discount_percentage
        };
      }
    });
  }

  selectProgram(program: string) {
    this.selectedProgram = program;
    this.loadProgramData();
  }

  calculateEffectiveMonthly(planType: string): number {
    const data = this.planData[planType];
    if (!data.amount) return 0;
    
    const months = planType === 'Monthly' ? 1 : planType === '6 Months' ? 6 : 12;
    return Math.round(data.amount / months);
  }

  calculateSavings(planType: string): number {
    if (planType === 'Monthly') return 0;
    
    const monthlyAmount = this.planData['Monthly'].amount;
    const planAmount = this.planData[planType].amount;
    const months = planType === '6 Months' ? 6 : 12;
    
    if (!monthlyAmount || !planAmount) return 0;
    
    return (monthlyAmount * months) - planAmount;
  }

  saveFeeStructure() {
    // Validate that at least one amount is entered
    const hasData = this.planTypes.some(planType => this.planData[planType].amount > 0);
    
    if (!hasData) {
      alert('❌ Please enter at least one fee amount before saving.');
      return;
    }
    
    this.saving.set(true);
    
    const structures: FeeStructure[] = this.planTypes.map(planType => ({
      program: this.selectedProgram,
      plan_type: planType,
      amount: this.planData[planType].amount,
      discount_percentage: this.planData[planType].discount,
      academic_year: this.currentYear,
      is_active: true
    }));

    console.log('Saving fee structures:', structures);

    this.api.saveFeeStructures(structures).subscribe({
      next: (response) => {
        console.log('Save response:', response);
        this.saving.set(false);
        alert(`✅ Fee structure saved for ${this.selectedProgram} (${this.currentYear})!`);
        this.loadFeeStructures();
      },
      error: (err) => {
        console.error('Error saving fee structure:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        this.saving.set(false);
        
        let errorMsg = 'Failed to save fee structure.';
        
        if (err?.error?.error) {
          errorMsg = err.error.error;
        } else if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.statusText) {
          errorMsg = err.statusText;
        }
        
        if (err.status === 0) {
          alert('❌ Cannot connect to server!\n\nPlease check:\n1. Backend is running\n2. Internet connection\n3. CORS is configured');
        } else if (err.status === 401) {
          alert('❌ Authentication failed!\n\nPlease logout and login again.');
        } else if (err.status === 403) {
          alert('❌ Permission denied!\n\nOnly owners can save fee structures.');
        } else if (err.status === 400) {
          alert('❌ Invalid data!\n\n' + errorMsg);
        } else if (err.status === 500) {
          alert('❌ Server error!\n\n' + errorMsg + '\n\nPlease check the backend logs.');
        } else {
          alert('❌ Error: ' + errorMsg + '\n\nStatus: ' + (err.status || 'Unknown'));
        }
      }
    });
  }

  copyFromProgram(sourceProgram: string) {
    const structures = this.feeStructures().filter(
      f => f.program === sourceProgram && f.academic_year === this.currentYear
    );
    
    structures.forEach(s => {
      if (this.planData[s.plan_type]) {
        this.planData[s.plan_type] = {
          amount: s.amount,
          discount: s.discount_percentage
        };
      }
    });
  }

  fmt(amount: number): string {
    return '₹' + (amount || 0).toLocaleString('en-IN');
  }
}
