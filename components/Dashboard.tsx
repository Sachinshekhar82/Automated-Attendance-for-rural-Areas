import React from 'react';
import { ClassSection } from '../types';

interface DashboardProps {
  classes: ClassSection[];
  onSelectClass: (classId: string) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ classes, onSelectClass, onLogout }) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 pb-24 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Govt. School, Punjab</h1>
          <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Logout"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </header>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200">
          <p className="text-blue-100 text-xs uppercase font-semibold">Total Present</p>
          <div className="flex items-end mt-1">
            <span className="text-3xl font-bold">85%</span>
            <span className="text-blue-200 text-xs ml-2 mb-1">Today</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs uppercase font-semibold">Reports Due</p>
          <div className="flex items-end mt-1">
            <span className="text-3xl font-bold text-gray-800">2</span>
            <span className="text-red-500 text-xs ml-2 mb-1">High Priority</span>
          </div>
        </div>
      </div>

      {/* Action Prompt */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-orange-700">
              Mid-day meal report sync pending for yesterday.
            </p>
          </div>
        </div>
      </div>

      {/* Class List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Mark Attendance</h2>
        <div className="space-y-3">
          {classes.map((cls) => {
            const markedCount = cls.students.filter(s => s.status !== 'UNMARKED').length;
            const progress = (markedCount / cls.totalStudents) * 100;
            
            return (
              <button
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-bold text-gray-800">{cls.name}</h3>
                  <p className="text-xs text-gray-500">Grade {cls.grade} • {cls.totalStudents} Students</p>
                </div>
                
                <div className="flex items-center space-x-3">
                   {/* Progress Ring or Bar */}
                   <div className="text-right">
                     <span className="text-xs font-medium block text-gray-600">
                       {markedCount}/{cls.totalStudents}
                     </span>
                     <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                       <div 
                         className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                         style={{ width: `${progress}%` }}
                       />
                     </div>
                   </div>
                   <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                   </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};