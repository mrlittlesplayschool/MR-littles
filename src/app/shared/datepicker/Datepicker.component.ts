import { Component, Input, Output, EventEmitter, OnInit, OnChanges,
         HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="dp-wrap" [class.open]="isOpen" [class.align-right]="alignRight">

  <div class="dp-input" (click)="toggle($event)">
    <span class="dp-icon">📅</span>
    <span class="dp-value" [class.placeholder]="!displayValue">
      {{ displayValue || placeholder }}
    </span>
    <span class="dp-arrow" [class.rotated]="isOpen">▾</span>
  </div>

  <div class="dp-dropdown glass" *ngIf="isOpen" (click)="$event.stopPropagation()">

    <div class="dp-header">
      <button class="dp-nav" (click)="prevMonth()">‹</button>
      <div class="dp-month-year">
        <button class="dp-my-btn" (click)="toggleMonthPicker()">{{ monthNames[viewMonth] }}</button>
        <button class="dp-my-btn" (click)="toggleYearPicker()">{{ viewYear }}</button>
      </div>
      <button class="dp-nav" (click)="nextMonth()" [disabled]="isNextDisabled()">›</button>
    </div>

    <div class="dp-month-grid" *ngIf="showMonthPicker">
      <button *ngFor="let m of monthNames; let i = index"
        class="dp-m-btn" [class.active]="i === viewMonth"
        [disabled]="isMonthDisabled(i)" (click)="selectMonth(i)">
        {{ m.slice(0,3) }}
      </button>
    </div>

    <div class="dp-year-grid" *ngIf="showYearPicker">
      <button *ngFor="let y of yearRange"
        class="dp-y-btn" [class.active]="y === viewYear"
        [disabled]="isYearDisabled(y)" (click)="selectYear(y)">
        {{ y }}
      </button>
    </div>

    <div *ngIf="!showMonthPicker && !showYearPicker">
      <div class="dp-weekdays">
        <span *ngFor="let d of weekDays">{{ d }}</span>
      </div>
      <div class="dp-days">
        <span *ngFor="let blank of blanks" class="dp-day empty"></span>
        <button *ngFor="let day of daysInMonth"
          class="dp-day"
          [class.today]="isToday(day)"
          [class.selected]="isSelected(day)"
          [class.disabled]="isDayDisabled(day)"
          [disabled]="isDayDisabled(day)"
          (click)="selectDay(day)">
          {{ day }}
        </button>
      </div>
    </div>

    <div class="dp-footer">
      <button class="dp-foot-btn" (click)="selectToday()" *ngIf="!noFuture || !isTodayDisabled()">Today</button>
      <button class="dp-foot-btn danger" (click)="clear()" *ngIf="displayValue">Clear</button>
    </div>

  </div>
</div>
  `,
  styleUrl: './datepicker.component.scss'
})
export class DatepickerComponent implements OnInit, OnChanges {
  private el = inject(ElementRef);

  @Input() value       = '';
  @Input() placeholder = 'Select date';
  @Input() noFuture    = false;
  @Input() noPast      = false;
  @Output() valueChange = new EventEmitter<string>();

  isOpen          = false;
  alignRight      = false;   // ← property added here
  showMonthPicker = false;
  showYearPicker  = false;

  today      = new Date();
  viewMonth  = this.today.getMonth();
  viewYear   = this.today.getFullYear();

  weekDays   = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  monthNames = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

  blanks:      number[] = [];
  daysInMonth: number[] = [];
  yearRange:   number[] = [];
  displayValue = '';

  ngOnInit()    { this.buildYearRange(); this.buildCalendar(); this.updateDisplay(); }

  ngOnChanges() {
    if (this.value) {
      const d    = new Date(this.value + 'T00:00:00');
      this.viewMonth = d.getMonth();
      this.viewYear  = d.getFullYear();
    }
    this.buildYearRange();
    this.buildCalendar();
    this.updateDisplay();
  }

  buildYearRange() {
    const start = this.noFuture ? this.today.getFullYear() - 20 : this.today.getFullYear() - 5;
    const end   = this.noFuture ? this.today.getFullYear()      : this.today.getFullYear() + 2;
    this.yearRange = Array.from({ length: end - start + 1 }, (_, i) => start + i).reverse();
  }

  buildCalendar() {
    const first = new Date(this.viewYear, this.viewMonth, 1);
    const days  = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    this.blanks      = Array(first.getDay()).fill(0);
    this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1);
  }

  updateDisplay() {
    if (!this.value) { this.displayValue = ''; return; }
    const d = new Date(this.value + 'T00:00:00');
    this.displayValue = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  toggle(event: MouseEvent) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    this.showMonthPicker = false;
    this.showYearPicker  = false;

    // Auto-detect if near right edge → align dropdown to the right
    if (this.isOpen) {
      const rect = this.el.nativeElement.getBoundingClientRect();
      this.alignRight = (rect.left + 280) > window.innerWidth;
    }
  }

  toggleMonthPicker() { this.showMonthPicker = !this.showMonthPicker; this.showYearPicker  = false; }
  toggleYearPicker()  { this.showYearPicker  = !this.showYearPicker;  this.showMonthPicker = false; }

  prevMonth() {
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear--; }
    else this.viewMonth--;
    this.buildCalendar();
  }

  nextMonth() {
    if (this.isNextDisabled()) return;
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++; }
    else this.viewMonth++;
    this.buildCalendar();
  }

  isNextDisabled(): boolean {
    if (!this.noFuture) return false;
    return this.viewYear === this.today.getFullYear() && this.viewMonth >= this.today.getMonth();
  }

  isMonthDisabled(m: number): boolean {
    return this.noFuture && this.viewYear === this.today.getFullYear() && m > this.today.getMonth();
  }

  isYearDisabled(y: number): boolean {
    return this.noFuture && y > this.today.getFullYear();
  }

  isDayDisabled(day: number): boolean {
    const d = new Date(this.viewYear, this.viewMonth, day);
    if (this.noFuture && d > this.today) return true;
    return false;
  }

  isToday(day: number): boolean {
    return day === this.today.getDate()
      && this.viewMonth === this.today.getMonth()
      && this.viewYear  === this.today.getFullYear();
  }

  isSelected(day: number): boolean {
    if (!this.value) return false;
    const d = new Date(this.value + 'T00:00:00');
    return day === d.getDate() && this.viewMonth === d.getMonth() && this.viewYear === d.getFullYear();
  }

  isTodayDisabled(): boolean { return this.isDayDisabled(this.today.getDate()); }

  selectDay(day: number) {
    if (this.isDayDisabled(day)) return;
    const mm  = String(this.viewMonth + 1).padStart(2, '0');
    const dd  = String(day).padStart(2, '0');
    const val = `${this.viewYear}-${mm}-${dd}`;
    this.value = val;
    this.valueChange.emit(val);
    this.updateDisplay();
    this.isOpen = false;
  }

  selectMonth(m: number) { this.viewMonth = m; this.showMonthPicker = false; this.buildCalendar(); }
  selectYear(y: number)  { this.viewYear  = y; this.showYearPicker  = false; this.buildCalendar(); }

  selectToday() {
    const t   = this.today;
    const mm  = String(t.getMonth() + 1).padStart(2, '0');
    const dd  = String(t.getDate()).padStart(2, '0');
    const val = `${t.getFullYear()}-${mm}-${dd}`;
    this.value     = val;
    this.viewMonth = t.getMonth();
    this.viewYear  = t.getFullYear();
    this.valueChange.emit(val);
    this.updateDisplay();
    this.buildCalendar();
    this.isOpen = false;
  }

  clear() {
    this.value        = '';
    this.displayValue = '';
    this.valueChange.emit('');
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}