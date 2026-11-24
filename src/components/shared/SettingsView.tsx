import React, { useState } from 'react';
import { Download, HardDrive, Languages, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';
import { LanguageCode } from '../../types/domain';

const LANGUAGES: Array<{ code: LanguageCode; label: string; nativeLabel: string }> = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
];

export const SettingsView: React.FC = () => {
  const {
    role,
    language,
    messages,
    profile,
    diagnostics,
    swStatus,
    pwaInstall,
    network,
    changeLanguage,
    switchRole,
    resetLocalStorage,
  } = usePathweave();

  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const handleReset = async () => {
    await resetLocalStorage();
    setResetConfirmed(false);
    setResetMessage('Local IndexedDB records cleared. Sample curriculum data remains available.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{messages.settings.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{messages.settings.subtitle}</p>
      </div>

      {/* Language Selection */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <Languages className="mt-0.5 h-5 w-5 text-teal-700 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              {messages.settings.languageSection}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Choose the interface and curriculum display language. Saved locally in IndexedDB.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {LANGUAGES.map((item) => {
                const active = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => changeLanguage(item.code)}
                    className={`flex min-h-[48px] items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                      active
                        ? 'border-teal-700 bg-teal-50 text-teal-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{item.nativeLabel}</div>
                      <div className="text-xs text-slate-500">{item.label}</div>
                    </div>
                    {active && (
                      <span className="text-xs font-semibold text-teal-700">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Role Switcher */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <UserCheck className="mt-0.5 h-5 w-5 text-teal-700 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              {messages.settings.roleSection}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Active profile: <span className="font-medium text-slate-900">{profile.name}</span> ·{' '}
              {profile.schoolName} · {profile.gradeOrSubject}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => switchRole('student')}
                className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  role === 'student'
                    ? 'bg-teal-700 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {messages.studentPortal}
              </button>
              <button
                type="button"
                onClick={() => switchRole('teacher')}
                className={`min-h-[44px] rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  role === 'teacher'
                    ? 'bg-teal-700 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {messages.teacherPortal}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Local Storage Architecture & Diagnostics */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <HardDrive className="mt-0.5 h-5 w-5 text-teal-700 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              {messages.settings.storageSection}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Active storage adapter:{' '}
              <span className="font-mono font-medium text-slate-900">
                {diagnostics?.engine ?? 'Initializing...'}
              </span>{' '}
              · Database: <span className="font-mono text-slate-800">pathweave_local_db</span>
            </p>

            {diagnostics && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Lesson Progress</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    {diagnostics.counts.progress}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Quiz Attempts</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    {diagnostics.counts.quizAttempts}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Offline Downloads</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    {diagnostics.counts.downloads}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Staged Sync Queue</div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    {diagnostics.counts.syncQueue}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!resetConfirmed ? (
                <button
                  type="button"
                  onClick={() => setResetConfirmed(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  {messages.settings.resetLocalData}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[44px] rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Confirm Reset Local Records
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetConfirmed(false)}
                    className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {resetMessage && (
                <span className="text-xs font-medium text-teal-700">{resetMessage}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PWA & Offline Readiness */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-teal-700 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              {messages.settings.pwaSection}
            </h3>
            <div className="mt-2 space-y-1.5 text-sm text-slate-600">
              <p>
                Browser connectivity:{' '}
                <span className="font-medium text-slate-900">
                  {network.isOnline ? messages.online : messages.offline}
                </span>
                {network.effectiveType ? ` · Connection: ${network.effectiveType}` : ''}
              </p>
              <p>
                Service Worker scaffold:{' '}
                <span className="font-medium text-slate-900">
                  {swStatus.registered
                    ? `Registered (${swStatus.scope ?? '/'})`
                    : swStatus.supported
                      ? 'Supported (pending registration)'
                      : 'Not supported in this browser'}
                </span>
              </p>
              <p>
                Stage 2 roadmap: Peer-to-peer Wi-Fi Direct / WebRTC packet exchange and cloud
                synchronization are intentionally excluded from Stage 1.
              </p>
            </div>

            {!pwaInstall.isInstalled && pwaInstall.isInstallable && (
              <button
                type="button"
                onClick={() => pwaInstall.install()}
                className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {messages.settings.installApp}
              </button>
            )}

            {!pwaInstall.isInstalled && !pwaInstall.isInstallable && pwaInstall.isIOS && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowIOSGuide((v) => !v)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Install Instructions (iOS Safari)
                </button>
                {showIOSGuide && (
                  <p className="mt-2 text-xs text-slate-600">
                    Tap the Safari Share icon and choose Add to Home Screen to install PATHWEAVE.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
