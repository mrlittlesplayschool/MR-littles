import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const noCache = new HttpHeaders({
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
});

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http   = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ── Students
  getStudents()            { return this.http.get<any[]>(`${this.apiUrl}/students`, { headers: noCache }); }
  getStudent(id: number)   { return this.http.get<any>(`${this.apiUrl}/students/${id}`, { headers: noCache }); }
  createStudent(data: any) { return this.http.post<any>(`${this.apiUrl}/students`, data); }
  updateStudent(id: number, data: any) { return this.http.put<any>(`${this.apiUrl}/students/${id}`, data); }
  deleteStudent(id: number){ return this.http.delete<any>(`${this.apiUrl}/students/${id}`); }

  // ── Attendance
  getAttendance(date?: string, program?: string) {
    let url = `${this.apiUrl}/attendance`;
    const params: string[] = [];
    if (date)    params.push(`date=${date}`);
    if (program) params.push(`program=${program}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<any[]>(url, { headers: noCache });
  }
  saveAttendance(date: string, records: any[]) {
    return this.http.post<any>(`${this.apiUrl}/attendance`, { date, records });
  }

  // ── Fees
  getFees()               { return this.http.get<any[]>(`${this.apiUrl}/fees`, { headers: noCache }); }
  createFee(data: any)    { return this.http.post<any>(`${this.apiUrl}/fees`, data); }
  collectFee(fee_id: number, amount: number) {
    return this.http.post<any>(`${this.apiUrl}/fees/collect`, { fee_id, amount });
  }

  // ── Teachers
  getTeachers()            { return this.http.get<any[]>(`${this.apiUrl}/teachers`, { headers: noCache }); }
  createTeacher(data: any) { return this.http.post<any>(`${this.apiUrl}/teachers`, data); }
  updateSalary(id: number, salary_month: string) {
    return this.http.put<any>(`${this.apiUrl}/teachers/${id}/salary`, { salary_month });
  }
  deleteTeacher(id: number){ return this.http.delete<any>(`${this.apiUrl}/teachers/${id}`); }

  // ── Enquiries
  getEnquiries()           { return this.http.get<any[]>(`${this.apiUrl}/enquiries`, { headers: noCache }); }
  createEnquiry(data: any) { return this.http.post<any>(`${this.apiUrl}/enquiries`, data); }
  updateEnquiryStatus(id: number, status: string) {
    return this.http.patch<any>(`${this.apiUrl}/enquiries/${id}/status`, { status });
  }
  deleteEnquiry(id: number){ return this.http.delete<any>(`${this.apiUrl}/enquiries/${id}`); }

  // ── Events
  getEvents()              { return this.http.get<any[]>(`${this.apiUrl}/events`, { headers: noCache }); }
  createEvent(data: any)   { return this.http.post<any>(`${this.apiUrl}/events`, data); }
  deleteEvent(id: number)  { return this.http.delete<any>(`${this.apiUrl}/events/${id}`); }

  // ── Fee Structures
  getFeeStructures(year?: string) { 
    const url = year ? `${this.apiUrl}/fee-structures?year=${year}` : `${this.apiUrl}/fee-structures`;
    return this.http.get<any[]>(url, { headers: noCache }); 
  }
  saveFeeStructures(data: any[]) { return this.http.post<any>(`${this.apiUrl}/fee-structures/bulk`, data); }
  updateFeeStructure(id: number, data: any) { return this.http.put<any>(`${this.apiUrl}/fee-structures/${id}`, data); }
  deleteFeeStructure(id: number) { return this.http.delete<any>(`${this.apiUrl}/fee-structures/${id}`); }
}