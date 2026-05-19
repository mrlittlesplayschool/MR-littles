export interface StudentAttendance {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late';
  markedBy: string;
}

export interface TeacherAttendance {
  id: string;
  date: string;
  teacherId: string;
  teacherName: string;
  status: 'Present' | 'Absent' | 'Half-Day' | 'Leave';
  notes?: string;
}