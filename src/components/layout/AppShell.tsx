import React, { useState } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Download,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Library,
  Menu,
  RefreshCcw,
  Settings,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { LanguageCode, StudentNavTab, TeacherNavTab } from '../../types/domain';

interface AppShellProps {
  children: React.ReactNode;
}

const LANG_BUTTONS: Array<{ code: LanguageCode; shortLabel: string; label: string }> = [
  { code: 'en', shortLabel: 'EN', label: 'English' },
  { code: 'kn', shortLabel: 'ಕನ್ನಡ', label: 'Kannada' },
  { code: 'hi', shortLabel: 'हिन्दी', label: 'Hindi' },
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    role,
    language,
    messages,
    profile,
    studentTab,
    teacherTab,
    network,
    offlineTestMode,
    syncQueue,
    swStatus,
    applySwUpdate,
    dismissSwUpdate,
    pwaInstall,
    setStudentTab,
    setTeacherTab,
    switchRole,
    changeLanguage,
    setOfflineTestMode,
  } = usePathweave();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentNavItems: Array<{ id: StudentNavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: messages.nav.dashboard, icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'subjects', label: messages.nav.mySubjects, icon: <Library className="h-4 w-4" /> },
    { id: 'lessons', label: messages.nav.lessons, icon: <BookOpen className="h-4 w-4" /> },
    { id: 'practice', label: messages.nav.practice, icon: <ClipboardCheck className="h-4 w-4" /> },
    { id: 'progress', label: messages.nav.myProgress, icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'settings', label: messages.nav.settings, icon: <Settings className="h-4 w-4" /> },
  ];

  const teacherNavItems: Array<{ id: TeacherNavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: messages.nav.dashboard, icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'students', label: messages.nav.students, icon: <Users className="h-4 w-4" /> },
    {
      id: 'materials',
      label: messages.nav.learningMaterials,
      icon: <FolderKanban className="h-4 w-4" />,
    },
    {
      id: 'questions',
      label: messages.nav.questions,
      icon: <HelpCircle className="h-4 w-4" />,
    },
    { id: 'performance', label: messages.nav.performance, icon: <BarChart3 className="h-4 w-4" /> },
    {
      id: 'synchronization',
      label: messages.nav.synchronization,
      icon: <RefreshCcw className="h-4 w-4" />,
    },
    { id: 'settings', label: messages.nav.settings, icon: <Settings className="h-4 w-4" /> },
  ];

  const activeNavTitle =
    role === 'student'
      ? studentNavItems.find((n) => n.id === studentTab)?.label ?? messages.nav.dashboard
      : teacherNavItems.find((n) => n.id === teacherTab)?.label ?? messages.nav.dashboard;

  const handleSelectNav = (id: StudentNavTab | TeacherNavTab) => {
    if (role === 'student') {
      setStudentTab(id as StudentNavTab);
    } else {
      setTeacherTab(id as TeacherNavTab);
    }
    setMobileMenuOpen(false);
  };

  const networkLabel =
    network.mode === 'offline_simulated'
      ? messages.simulatedOffline
      : network.mode === 'offline_disconnected'
        ? `${messages.offline} (No Network)`
        : network.mode === 'offline_unreachable'
          ? `${messages.offline} (Server Unreachable)`
          : messages.online;

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-white">
      <div>
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shrink-0">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            {messages.appName}
          </span>
        </div>

        <div className="px-4 py-3 border-b border-slate-100">
          <div className="text-xs font-medium text-slate-500">
            {role === 'student' ? messages.studentPortal : messages.teacherPortal}
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            {profile.name}
          </div>
          <div className="truncate text-xs text-slate-500">{profile.gradeOrSubject}</div>
        </div>

        <nav aria-label="Primary navigation" className="space-y-1 px-3 py-4">
          {(role === 'student' ? studentNavItems : teacherNavItems).map((item) => {
            const isActive =
              role === 'student' ? studentTab === item.id : teacherTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectNav(item.id)}
                className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-teal-700' : 'text-slate-400'} aria-hidden="true">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4 space-y-2.5">
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            {network.mode === 'offline_simulated' ? (
              <FlaskConical className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
            ) : network.isOnline ? (
              <Wifi className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
            )}
            <span className="font-semibold text-slate-800 truncate">{networkLabel}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{messages.pendingSync}</span>
            <span className="font-mono font-semibold text-slate-800 tabular-nums">
              {syncQueue.length}
            </span>
          </div>
        </div>

        {!pwaInstall.isInstalled && pwaInstall.isInstallable && (
          <button
            type="button"
            onClick={() => pwaInstall.install()}
            className="flex min-h-[40px] w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{messages.settings.installApp}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => switchRole(role === 'student' ? 'teacher' : 'student')}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap"
        >
          <ArrowLeftRight className="h-3.5 w-3.5 text-teal-700 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {role === 'student' ? messages.switchToTeacher : messages.switchToStudent}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r lg:border-slate-200 lg:sticky lg:top-0 lg:h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl">
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 truncate">
                <span className="lg:hidden font-display font-bold text-teal-800">
                  {messages.appName}
                </span>
                <span className="lg:hidden text-slate-300" aria-hidden="true">
                  /
                </span>
                <span className="truncate">{activeNavTitle}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <span>{role === 'student' ? messages.studentPortal : messages.teacherPortal}</span>
                <span aria-hidden="true">·</span>
                <span>{networkLabel}</span>
                {syncQueue.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-amber-800 tabular-nums">
                      {messages.pendingSync}: {syncQueue.length}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Language Switcher */}
            <div
              className="hidden sm:flex items-center rounded-lg bg-slate-100 p-1"
              role="group"
              aria-label={messages.languageLabel}
            >
              {LANG_BUTTONS.map((btn) => (
                <button
                  key={btn.code}
                  type="button"
                  onClick={() => changeLanguage(btn.code)}
                  aria-label={btn.label}
                  className={`min-h-[32px] rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    language === btn.code
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {btn.shortLabel}
                </button>
              ))}
            </div>

            {/* Primary Role Switch Action */}
            <button
              type="button"
              onClick={() => switchRole(role === 'student' ? 'teacher' : 'student')}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">
                {role === 'student' ? messages.switchToTeacher : messages.switchToStudent}
              </span>
              <span className="md:hidden">
                {role === 'student' ? 'Teacher' : 'Student'}
              </span>
            </button>
          </div>
        </header>

        {/* Safe Service Worker Update Banner */}
        {swStatus.needRefresh && (
          <div className="border-b border-teal-200 bg-teal-50 px-4 py-2.5 text-xs text-teal-950 sm:px-6 flex flex-wrap items-center justify-between gap-3">
            <span className="font-medium">
              A new cached version of PATHWEAVE is ready. Update safely when you are not mid-quiz.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={applySwUpdate}
                className="min-h-[34px] rounded-md bg-teal-700 px-3 py-1 font-semibold text-white hover:bg-teal-800"
              >
                Update Now
              </button>
              <button
                type="button"
                onClick={dismissSwUpdate}
                className="min-h-[34px] rounded-md border border-teal-300 bg-white px-3 py-1 font-medium text-teal-900 hover:bg-teal-100"
              >
                Later
              </button>
            </div>
          </div>
        )}

        {/* Distinct Connectivity Banners: Simulated Offline Test Mode vs Real Network Disconnection */}
        {offlineTestMode && (
          <div className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-950 sm:px-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              <FlaskConical className="h-4 w-4 text-amber-800 shrink-0" aria-hidden="true" />
              <span>
                {messages.simulatedOffline} — Actual browser network is{' '}
                {network.browserOnline ? 'connected' : 'disconnected'}. Testing offline IndexedDB
                lessons, quizzes, and pending sync queue ({syncQueue.length} queued).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOfflineTestMode(false)}
              className="min-h-[32px] rounded-md border border-amber-400 bg-white px-3 py-1 font-semibold text-amber-950 hover:bg-amber-100 whitespace-nowrap"
            >
              Exit Test Mode
            </button>
          </div>
        )}

        {!offlineTestMode && !network.isOnline && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-950 sm:px-6 flex flex-wrap items-center justify-between gap-2">
            <span>
              {network.mode === 'offline_unreachable'
                ? 'Offline (Server Unreachable) — Browser reports connection, but server ping failed. Running from IndexedDB & cached assets.'
                : 'Offline (Network Disconnected) — Running from cached app shell & IndexedDB local storage.'}
            </span>
            <button
              type="button"
              onClick={() => network.verifyConnectivity()}
              className="min-h-[32px] rounded-md border border-amber-300 bg-white px-3 py-1 font-semibold text-amber-950 hover:bg-amber-100 whitespace-nowrap"
            >
              {network.checkingReachability ? 'Checking...' : 'Check Connection'}
            </button>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};
