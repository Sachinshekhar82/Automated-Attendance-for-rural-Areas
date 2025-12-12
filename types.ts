export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  UNMARKED = 'UNMARKED'
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  photoUrl: string; // Placeholder for stored face embedding reference
  status: AttendanceStatus;
  confidence?: number; // Simulated AI confidence score
}

export interface ClassSection {
  id: string;
  name: string;
  grade: string;
  totalStudents: number;
  students: Student[];
}

export interface AIAnalysisResult {
  studentCount: number;
  environmentDescription: string;
  isClassroom: boolean;
  attentivenessScore: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CAMERA = 'CAMERA',
  REVIEW = 'REVIEW',
  REPORTS = 'REPORTS'
}