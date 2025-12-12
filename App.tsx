import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Camera } from './components/Camera';
import { AttendanceReview } from './components/AttendanceReview';
import { Login } from './components/Login';
import { MOCK_CLASSES } from './constants';
import { AppView, ClassSection, Student, AIAnalysisResult, AttendanceStatus } from './types';
import { analyzeClassroomImage } from './services/geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassSection[]>(MOCK_CLASSES);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to get actual class object
  const currentClass = classes.find(c => c.id === selectedClassId);

  // Authentication Handlers
  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedClassId(null);
    setCapturedImage(null);
    setAiResult(null);
    setIsProcessing(false);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentView(AppView.CAMERA); // Immediately prompt for camera
  };

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setIsProcessing(true);
    setCurrentView(AppView.REVIEW);

    // Call Gemini API to analyze the image
    // Pass the students list so Gemini can perform face recognition against reference photos
    const result = await analyzeClassroomImage(imageSrc, currentClass?.students || []);
    setAiResult(result);

    if (selectedClassId) {
      setClasses(prevClasses => prevClasses.map(cls => {
        if (cls.id === selectedClassId) {
           const updatedStudents = cls.students.map(student => {
             // Check if the student's ID was returned by the AI
             const isIdentified = result.presentStudentIds?.includes(student.id);
             
             return {
               ...student,
               status: isIdentified ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
               confidence: isIdentified ? 0.95 : undefined // Mock confidence
             };
           });

           return { ...cls, students: updatedStudents };
        }
        return cls;
      }));
    }

    setIsProcessing(false);
  };

  const handleAttendanceSave = (updatedStudents: Student[]) => {
    if (selectedClassId) {
      setClasses(prev => prev.map(cls => {
        if (cls.id === selectedClassId) {
          return { ...cls, students: updatedStudents };
        }
        return cls;
      }));
      // Show success feedback (mock)
      alert("Attendance synced with Govt server successfully!");
      setCurrentView(AppView.DASHBOARD);
      setSelectedClassId(null);
      setCapturedImage(null);
      setAiResult(null);
    }
  };

  // Login View Wrapper
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard classes={classes} onSelectClass={handleClassSelect} onLogout={handleLogout} />;
      
      case AppView.CAMERA:
        return <Camera onCapture={handleCapture} onClose={() => setCurrentView(AppView.DASHBOARD)} />;
      
      case AppView.REVIEW:
        if (!currentClass || !capturedImage) return <Dashboard classes={classes} onSelectClass={handleClassSelect} onLogout={handleLogout} />;
        return (
          <AttendanceReview 
            currentClass={currentClass} 
            imageSrc={capturedImage}
            aiResult={aiResult}
            onSave={handleAttendanceSave}
            onRetake={() => setCurrentView(AppView.CAMERA)}
            isProcessing={isProcessing}
          />
        );
      
      case AppView.REPORTS:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Reports</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Report generation module would be here.<br/>(Export to Excel/PDF)
            </div>
          </div>
        );
        
      default:
        return <Dashboard classes={classes} onSelectClass={handleClassSelect} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-2xl relative">
      {renderView()}
      
      {/* Only show Navbar if not in Camera or Fullscreen Review processing */}
      {currentView !== AppView.CAMERA && !isProcessing && (
        <Navbar currentView={currentView} onChangeView={setCurrentView} />
      )}
    </div>
  );
};

export default App;