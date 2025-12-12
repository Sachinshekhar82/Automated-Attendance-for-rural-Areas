import React, { useState } from 'react';
import { ClassSection, AttendanceStatus, AIAnalysisResult, Student } from '../types';

interface AttendanceReviewProps {
  currentClass: ClassSection;
  imageSrc: string;
  aiResult: AIAnalysisResult | null;
  onSave: (updatedStudents: Student[]) => void;
  onRetake: () => void;
  isProcessing: boolean;
}

export const AttendanceReview: React.FC<AttendanceReviewProps> = ({
  currentClass,
  imageSrc,
  aiResult,
  onSave,
  onRetake,
  isProcessing
}) => {
  const [students, setStudents] = useState<Student[]>(currentClass.students);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newRoll, setNewRoll] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | null>(null);

  const toggleStatus = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: s.status === AttendanceStatus.PRESENT ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT
        };
      }
      return s;
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = () => {
    if (!newName.trim() || !newRoll.trim()) {
      alert("Please enter both Name and Roll Number.");
      return;
    }

    const newStudent: Student = {
      id: `manual_${Date.now()}`,
      name: newName,
      rollNumber: newRoll,
      // Use uploaded photo or generate a colorful initial avatar
      photoUrl: newPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=random&color=fff`,
      status: AttendanceStatus.PRESENT // Default to present since we are manually adding them
    };

    setStudents(prev => [...prev, newStudent]);
    
    // Close and Reset
    setIsAddModalOpen(false);
    setNewName('');
    setNewRoll('');
    setNewPhoto(null);
  };

  const presentCount = students.filter(s => s.status === AttendanceStatus.PRESENT).length;

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-white">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-gray-800">Analyzing Classroom...</h2>
        <p className="text-gray-500 text-center mt-2 max-w-xs">
          Identifying faces and verifying student presence using Smart AI.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center">
        <button onClick={onRetake} className="text-blue-600 font-medium text-sm">Retake Photo</button>
        <h2 className="font-bold text-gray-800">Verify Attendance</h2>
        <button 
          onClick={() => onSave(students)} 
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm active:bg-blue-700"
        >
          Submit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {/* Captured Image & AI Stats */}
        <div className="bg-gray-900 text-white p-4">
          <div className="relative rounded-lg overflow-hidden mb-4 border border-gray-700">
             <img src={imageSrc} alt="Classroom" className="w-full h-48 object-cover opacity-80" />
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-mono">
                  {aiResult?.isClassroom ? '✅ Classroom Detected' : '⚠ Environment Unclear'}
                </span>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">AI Headcount</p>
                <p className="text-xl font-bold text-blue-400">{aiResult?.studentCount ?? '--'}</p>
             </div>
             <div className="bg-gray-800 p-3 rounded-lg">
                <p className="text-gray-400 text-xs">Environment</p>
                <p className="text-sm font-medium leading-tight mt-1">{aiResult?.attentivenessScore || "Analyzing..."}</p>
             </div>
          </div>
          {aiResult && (
             <p className="text-xs text-gray-500 mt-2 italic">"{aiResult.environmentDescription}"</p>
          )}
        </div>

        {/* List Controls */}
        <div className="bg-white sticky top-0 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
           <div className="flex space-x-2">
             <span className="text-sm font-medium text-gray-600">Total: {students.length}</span>
             <span className="text-sm font-bold text-green-600">Present: {presentCount}</span>
           </div>
           <div className="flex space-x-2 text-xs">
             <button onClick={() => markAll(AttendanceStatus.PRESENT)} className="text-blue-600 font-medium">Mark All</button>
             <span className="text-gray-300">|</span>
             <button onClick={() => markAll(AttendanceStatus.ABSENT)} className="text-red-600 font-medium">Unmark All</button>
           </div>
        </div>

        {/* Student List */}
        <div className="p-4 space-y-3">
          {students.map((student) => {
            const isPresent = student.status === AttendanceStatus.PRESENT;
            return (
              <div 
                key={student.id} 
                onClick={() => toggleStatus(student.id)}
                className={`flex items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isPresent 
                    ? 'bg-green-50 border-green-200 shadow-sm' 
                    : 'bg-white border-gray-200 opacity-60 grayscale'
                }`}
              >
                <div className="relative">
                  <img src={student.photoUrl} alt={student.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  {isPresent && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-0.5 rounded-full border-2 border-white">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className={`font-semibold ${isPresent ? 'text-gray-900' : 'text-gray-500'}`}>{student.name}</h3>
                  <p className="text-xs text-gray-500">Roll No: {student.rollNumber}</p>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {student.status}
                </div>
              </div>
            );
          })}

          {/* Add Missing Student Button */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Add Missing Student</span>
          </button>
        </div>
      </div>

      {/* Manual Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Add Student</h3>
            <p className="text-sm text-gray-500 mb-5">Enter details for the student missed by AI.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Rohini Singh"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Roll Number</label>
                <input 
                  type="text" 
                  value={newRoll}
                  onChange={(e) => setNewRoll(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. 109"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Student Photo</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200">
                      {newPhoto ? (
                        <img src={newPhoto} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-center text-gray-700 hover:bg-gray-50 font-medium">
                      Upload Photo
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => { setIsAddModalOpen(false); setNewName(''); setNewRoll(''); setNewPhoto(null); }}
                className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddStudent}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};