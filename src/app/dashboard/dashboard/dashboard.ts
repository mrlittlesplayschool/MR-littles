import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, catchError, of, timeout } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth';
import { DatepickerComponent } from '../../shared/datepicker/Datepicker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DatepickerComponent],
  templateUrl: './dashboard.html',
  styleUrl:    './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);
  private cdr  = inject(ChangeDetectorRef);

  isOwner = this.auth.getUserRole() === 'owner';
  loading = true;

  stats = [
    { icon:'👦',  label:'Total Students',     value:'—', sub:'—', color:'var(--sun)',  bg:'rgba(255,179,71,.12)'  },
    { icon:'👩‍🏫', label:'Teachers',           value:'—', sub:'—', color:'var(--sky)',  bg:'rgba(94,196,255,.12)'  },
    { icon:'💰',  label:'Fees Collected',     value:'—', sub:'—', color:'var(--leaf)', bg:'rgba(93,220,140,.12)'  },
    { icon:'⚠️',  label:'Fees Pending',       value:'—', sub:'—', color:'var(--rose)', bg:'rgba(255,126,179,.12)' },
    { icon:'✅',  label:"Today's Attendance", value:'—', sub:'—', color:'var(--sun)',  bg:'rgba(255,179,71,.12)'  },
    { icon:'📋',  label:'New Enquiries',      value:'—', sub:'—', color:'var(--sky)',  bg:'rgba(94,196,255,.12)'  },
  ];

  programs: any[] = [];
  events:   any[] = [];
  activity: any[] = [];

  showEventForm = false;
  savingEvent   = false;
  newEvent      = { title: '', event_date: '', tag: 'Event' };
  eventTags     = ['Event', 'Finance', 'Meeting', 'Holiday', 'Other'];

  ngOnInit() { 
    console.log('🚀 Dashboard component initialized');
    this.loadAll(); 
  }

  // Safe wrapper — never throws, always returns empty array on fail/timeout
  safe(obs: any) {
    return obs.pipe(
      timeout(8000),
      catchError((err: any) => {
        console.warn('API call failed:', err?.message || err);
        return of([]);
      })
    );
  }

async loadAll() {
  this.loading  = true;
  this.activity = [];

  // Safety timeout - force loading to false after 10 seconds
  const safetyTimeout = setTimeout(() => {
    console.error('⏰ Safety timeout triggered - forcing loading to false');
    this.loading = false;
  }, 10000);

  const today   = new Date().toISOString().split('T')[0];
  const token   = localStorage.getItem('ml_token');
  const base    = 'https://mr-littles-api-production.up.railway.app/api';
  
  console.log('🔄 Loading dashboard data...');
  console.log('📅 Date:', today);
  console.log('🔑 Token exists:', !!token);
  console.log('🔑 Token value:', token?.substring(0, 20) + '...');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Cache-Control': 'no-cache, no-store',
    'Pragma': 'no-cache'
  };

  const safeFetch = async (url: string): Promise<any[]> => {
    try {
      console.log(`📡 Fetching: ${url}`);
      const res  = await fetch(url, { headers });
      console.log(`✅ Response from ${url}:`, res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`❌ API ${url} returned ${res.status}:`, errorText);
        return [];
      }
      const data = await res.json();
      console.log(`📦 Data from ${url}:`, Array.isArray(data) ? `Array with ${data.length} items` : data);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(`❌ API ${url} failed:`, err);
      return [];
    }
  };

  try {
    const [students, fees, attendance, enquiries, events, teachers] = await Promise.all([
      safeFetch(`${base}/students`),
      safeFetch(`${base}/fees`),
      safeFetch(`${base}/attendance?date=${today}`),
      safeFetch(`${base}/enquiries`),
      safeFetch(`${base}/events`),
      this.isOwner ? safeFetch(`${base}/teachers`) : Promise.resolve([])
    ]);

    console.log('📊 Processing data:', { 
      students: students.length, 
      fees: fees.length, 
      attendance: attendance.length, 
      enquiries: enquiries.length, 
      events: events.length, 
      teachers: teachers.length 
    });
    this.processData({ students, fees, attendance, enquiries, events, teachers });
  } catch (error) {
    console.error('❌ Fatal error in loadAll:', error);
  } finally {
    clearTimeout(safetyTimeout);
    this.loading = false;
    console.log('✅ Loading complete, loading flag set to:', this.loading);
    this.cdr.detectChanges(); // Force Angular to update the view
  }
}
  processData({ students, fees, attendance, enquiries, events, teachers }: any) {
    console.log('🔧 processData called with:', { 
      studentsCount: students?.length, 
      feesCount: fees?.length, 
      attendanceCount: attendance?.length,
      enquiriesCount: enquiries?.length,
      eventsCount: events?.length,
      teachersCount: teachers?.length
    });

    const colorMap: Record<string, string> = {
      'Playgroup': 'var(--sun)',  'Nursery':   'var(--rose)',
      'Junior KG': 'var(--sky)', 'Senior KG': 'var(--leaf)',
      'LKG': 'var(--sky)',       'UKG':       'var(--leaf)'
    };

    // Students
    this.stats[0].value = String(students.length);
    this.stats[0].sub   = `${students.length} enrolled`;
    const countMap: Record<string, number> = {};
    students.forEach((s: any) => { countMap[s.program] = (countMap[s.program] || 0) + 1; });
    this.programs = Object.entries(countMap).map(([name, count]) => ({
      name, count, total: students.length, color: colorMap[name] || 'var(--sun)'
    }));

    // Teachers
    this.stats[1].value = (this.isOwner && teachers.length) ? String(teachers.length) : '—';
    this.stats[1].sub   = (this.isOwner && teachers.length) ? 'Active staff' : 'Owner only';

    // Fees
    const collected    = fees.reduce((s: number, f: any) => s + parseFloat(f.paid_amount || 0), 0);
    const pendingCount = fees.filter((f: any) => f.status !== 'Paid').length;
    this.stats[2].value = this.fmtMoney(collected);
    this.stats[2].sub   = 'Total collected';
    this.stats[3].value = String(pendingCount);
    this.stats[3].sub   = `${pendingCount} student${pendingCount !== 1 ? 's' : ''} due`;

    // Attendance
    const present = attendance.filter((r: any) => r.status === 'present').length;
    const ttl     = attendance.length;
    this.stats[4].value = ttl > 0 ? `${Math.round((present / ttl) * 100)}%` : '—';
    this.stats[4].sub   = ttl > 0 ? `${present} / ${ttl} present` : 'Not marked yet';

    // Enquiries
    const newOnes = enquiries.filter((e: any) => e.status === 'New');
    this.stats[5].value = String(newOnes.length);
    this.stats[5].sub   = newOnes.length > 0 ? 'Awaiting response' : 'All handled';

    // Events
    this.events = this.mapEvents(events);

    // Activity feed
    const recentStudents = [...students].slice(-2).reverse().map((s: any) => ({
      icon: '👦', color: 'var(--sun)',
      text: `${s.name} enrolled in ${s.program}`, time: 'Recent'
    }));
    const recentFees = fees
      .filter((f: any) => parseFloat(f.paid_amount) > 0).slice(0, 2)
      .map((f: any) => ({
        icon: '💰', color: 'var(--leaf)',
        text: `Fee received — ${f.student_name} (₹${Number(f.paid_amount).toLocaleString('en-IN')})`,
        time: 'Recent'
      }));
    const recentEnq = newOnes.slice(0, 2).map((e: any) => ({
      icon: '📋', color: 'var(--sky)',
      text: `New enquiry — ${e.parent_name} for ${e.child_name}`, time: 'Recent'
    }));
    const attendAct = ttl > 0 ? [{
      icon: '✅', color: 'var(--leaf)',
      text: `Attendance marked — ${present}/${ttl} present today`, time: 'Today'
    }] : [];

    this.activity = [...recentStudents, ...recentFees, ...attendAct, ...recentEnq];
  }

  mapEvents(data: any[]): any[] {
    return (data || []).map((e: any) => ({
      id:    e.id,
      date:  this.parseDate(e.event_date),
      label: e.title,
      tag:   e.tag
    }));
  }

  parseDate(raw: any): string {
    if (!raw) return '—';
    const part = String(raw).slice(0, 10);
    const [y, m, d] = part.split('-').map(Number);
    if (!y || !m || !d) return '—';
    return new Date(y, m - 1, d)
      .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  openEventForm()  { this.newEvent = { title: '', event_date: '', tag: 'Event' }; this.showEventForm = true; }
  closeEventForm() { this.showEventForm = false; }

  saveEvent() {
    if (!this.newEvent.title.trim()) { alert('Event title is required.'); return; }
    if (!this.newEvent.event_date)   { alert('Please select a date.'); return; }
    this.savingEvent = true;
    this.api.createEvent(this.newEvent).subscribe({
      next: (saved: any) => {
        // Instantly add to list without waiting for reload
        this.events = [...this.events, {
          id:    saved.id,
          date:  this.parseDate(saved.event_date),
          label: saved.title,
          tag:   saved.tag
        }];
        this.savingEvent   = false;
        this.showEventForm = false;
      },
      error: (err: any) => {
        console.error('Save event error:', err);
        this.savingEvent = false;
        alert(err?.error?.error || `Error ${err?.status || ''}: Failed to save event.`);
      }
    });
  }

  deleteEvent(id: number) {
    if (!confirm('Delete this event?')) return;
    this.events = this.events.filter(e => e.id !== id); // optimistic
    this.api.deleteEvent(id).subscribe({
      error: () => {
        alert('Failed to delete. Please refresh.');
        this.loadAll(); // revert on error
      }
    });
  }

  fmtMoney(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  getPct(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  tagClass(tag: string): string {
    const map: Record<string, string> = {
      'Finance': 'badge-green', 'Meeting': 'badge-blue',
      'Holiday': 'badge-yellow', 'Event': 'badge-gray', 'Other': 'badge-gray'
    };
    return map[tag] || 'badge-gray';
  }
}