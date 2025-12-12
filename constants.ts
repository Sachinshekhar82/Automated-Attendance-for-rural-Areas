import { ClassSection, AttendanceStatus, Student } from './types';

export const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'Aarav Singh', rollNumber: '101', photoUrl: 'https://picsum.photos/100/100?random=1', status: AttendanceStatus.UNMARKED },
  { id: '2', name: 'Diya Kaur', rollNumber: '102', photoUrl: 'https://picsum.photos/100/100?random=2', status: AttendanceStatus.UNMARKED },
  { id: '3', name: 'Ishaan Sharma', rollNumber: '103', photoUrl: 'https://picsum.photos/100/100?random=3', status: AttendanceStatus.UNMARKED },
  { id: '4', name: 'Vihaan Gupta', rollNumber: '104', photoUrl: 'https://picsum.photos/100/100?random=4', status: AttendanceStatus.UNMARKED },
  { id: '5', name: 'Ananya Verma', rollNumber: '105', photoUrl: 'https://picsum.photos/100/100?random=5', status: AttendanceStatus.UNMARKED },
  { id: '6', name: 'Rohan Mehta', rollNumber: '106', photoUrl: 'https://picsum.photos/100/100?random=6', status: AttendanceStatus.UNMARKED },
  { id: '7', name: 'Sanya Malhotra', rollNumber: '107', photoUrl: 'https://picsum.photos/100/100?random=7', status: AttendanceStatus.UNMARKED },
  { id: '8', name: 'Kabir Gill', rollNumber: '108', photoUrl: 'https://picsum.photos/100/100?random=8', status: AttendanceStatus.UNMARKED },
];

export const MOCK_CLASSES: ClassSection[] = [
  {
    id: 'c1',
    name: 'Class 5-A',
    grade: '5',
    totalStudents: 8,
    students: JSON.parse(JSON.stringify(MOCK_STUDENTS)) // Deep copy
  },
  {
    id: 'c2',
    name: 'Class 8-B',
    grade: '8',
    totalStudents: 35,
    students: []
  }
];

export const CHART_COLORS = {
  present: '#10B981', // green-500
  absent: '#EF4444', // red-500
  late: '#F59E0B', // amber-500
};