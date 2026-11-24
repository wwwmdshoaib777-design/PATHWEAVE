/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PathweaveProvider, usePathweave } from './context/PathweaveContext';
import { AppShell } from './components/layout/AppShell';
import { SettingsView } from './components/shared/SettingsView';
import { StudentDashboardView } from './components/student/StudentDashboardView';
import { StudentLessonsView } from './components/student/StudentLessonsView';
import { StudentPracticeView } from './components/student/StudentPracticeView';
import { StudentProgressView } from './components/student/StudentProgressView';
import { StudentSubjectsView } from './components/student/StudentSubjectsView';
import { TeacherDashboardView } from './components/teacher/TeacherDashboardView';
import { TeacherMaterialsView } from './components/teacher/TeacherMaterialsView';
import { TeacherPerformanceView } from './components/teacher/TeacherPerformanceView';
import { TeacherStudentsView } from './components/teacher/TeacherStudentsView';
import { TeacherSyncView } from './components/teacher/TeacherSyncView';

const PathweaveRouter: React.FC = () => {
  const { ready, role, studentTab, teacherTab } = usePathweave();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-600">
        Initializing PATHWEAVE local storage...
      </div>
    );
  }

  const renderContent = () => {
    if (role === 'student') {
      switch (studentTab) {
        case 'dashboard':
          return <StudentDashboardView />;
        case 'subjects':
          return <StudentSubjectsView />;
        case 'lessons':
          return <StudentLessonsView />;
        case 'practice':
          return <StudentPracticeView />;
        case 'progress':
          return <StudentProgressView />;
        case 'settings':
          return <SettingsView />;
      }
    }

    switch (teacherTab) {
      case 'dashboard':
        return <TeacherDashboardView />;
      case 'students':
        return <TeacherStudentsView />;
      case 'materials':
        return <TeacherMaterialsView />;
      case 'performance':
        return <TeacherPerformanceView />;
      case 'synchronization':
        return <TeacherSyncView />;
      case 'settings':
        return <SettingsView />;
    }
  };

  return <AppShell>{renderContent()}</AppShell>;
};

export default function App() {
  return (
    <PathweaveProvider>
      <PathweaveRouter />
    </PathweaveProvider>
  );
}
