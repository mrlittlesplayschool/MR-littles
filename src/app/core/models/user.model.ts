export type UserRole = 'owner' | 'teacher';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  classAssigned?: string;
}