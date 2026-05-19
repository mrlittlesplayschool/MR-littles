export type TeacherRole =
  | 'Lead Teacher'
  | 'Assistant Teacher'
  | 'Activity Coordinator'
  | 'Admin Staff';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  role: TeacherRole;
  classAssigned: string;
  contact: string;
  joinDate: string;
  salary: number;
  status: 'Active' | 'Inactive';
}