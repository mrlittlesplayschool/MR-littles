export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Visit Scheduled'
  | 'Enrolled'
  | 'Not Interested';

export interface Enquiry {
  id: string;
  childName: string;
  dob: string;
  parentName: string;
  contact: string;
  email?: string;
  program: string;
  status: EnquiryStatus;
  date: string;
  notes?: string;
  assignedTo?: string;
}