export type Program =
  | 'Tiny Explorers'
  | 'Creative Seedlings'
  | 'Discovery Builders'
  | 'School Readiness';

export interface Student {
  id: string;
  name: string;
  dob: string;
  parentName: string;
  contact: string;
  email?: string;
  address?: string;
  program: Program;
  status: 'Active' | 'Inactive';
  enrolledDate: string;
  notes?: string;
}