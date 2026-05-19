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
  currentYear = '2025-26';
  
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
    this.saving.set(true);
    
    const structures: FeeStructure[] = this.planTypes.map(planType => ({
      program: this.selectedProgram,
      plan_type: planType,
      amount: this.planData[planType].amount,
      discount_percentage: this.planData[planType].discount,
      academic_year: this.currentYear,
      is_active: true
    }));

    this.api.saveFeeStructures(structures).subscribe({
      next: () => {
        this.saving.set(false);
        alert(`Fee structure saved for ${this.selectedProgram}!`);
        this.loadFeeStructures();
      },
      error: (err) => {
        console.error('Error saving fee structure:', err);
        this.saving.set(false);
        alert('Failed to save fee structure. Please try again.');
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
