import React from 'react';
import { Download, FlaskConical, HardDrive, Info, RefreshCcw, Wifi, WifiOff } from 'lucide-react';
import { usePathweave } from '../../context/PathweaveContext';

export const TeacherSyncView: React.FC = () => {
  const {
    messages,
    network,
    offlineTestMode,
    diagnostics,
    syncQueue,
    lastSyncResult,
    learningPackets,
    attemptSync,
    exportPacketJson,
  } = usePathweave();

  const statusText =
    network.mode === 'offline_simulated'
      ? messages.simulatedOffline
      : network.mode === 'offline_disconnected'
        ? `${messages.offline} (Disconnected)`
        : network.mode === 'offline_unreachable'
          ? `${messages.offline} (Server Unreachable)`
          : messages.online;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {messages.teacher.syncStatusTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Inspect pending synchronization events in IndexedDB, verify connectivity, and export
            packet manifests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => attemptSync()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 self-start"
        >
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Attempt Synchronization ({syncQueue.length})
        </button>
      </div>

      {/* Honest Stage 2 Boundary Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 text-amber-800 shrink-0" aria-hidden="true" />
        <div className="text-sm text-amber-950">
          <div className="font-semibold">Stage 2 Local Queue & Offline Integrity</div>
          <p className="mt-1 leading-relaxed">{messages.teacher.stage1SyncNotice}</p>
        </div>
      </div>

      {lastSyncResult && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
          <div className="font-semibold text-slate-900">Last Synchronization Check</div>
          <p className="mt-1 text-xs text-slate-600">
            {lastSyncResult.message} · Retained locally:{' '}
            <span className="font-mono font-semibold tabular-nums">
              {lastSyncResult.retainedCount}
            </span>{' '}
            · Checked {new Date(lastSyncResult.attemptedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Connectivity & Storage State */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            {offlineTestMode ? (
              <FlaskConical className="h-4 w-4 text-amber-700" aria-hidden="true" />
            ) : network.isOnline ? (
              <Wifi className="h-4 w-4 text-teal-700" aria-hidden="true" />
            ) : (
              <WifiOff className="h-4 w-4 text-amber-700" aria-hidden="true" />
            )}
            Network Transport State
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">{statusText}</div>
          <div className="mt-1 text-xs text-slate-500">
            {network.lastCheckedAt
              ? `Last verified ${new Date(network.lastCheckedAt).toLocaleTimeString()}`
              : 'Verifying server reachability...'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <HardDrive className="h-4 w-4 text-teal-700" aria-hidden="true" />
            Local Persistence Engine
          </div>
          <div className="mt-2 font-mono text-lg font-semibold text-slate-900">
            {diagnostics?.engine ?? 'IndexedDB'}
          </div>
          <div className="mt-1 text-xs text-slate-500 tabular-nums">
            {syncQueue.length} pending event(s) stored persistently until server confirmation
          </div>
        </div>
      </div>

      {/* Pending Synchronization Events Queue */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Pending Synchronization Events ({syncQueue.length})
          </h3>
          <span className="text-xs text-slate-500">IndexedDB · syncQueue</span>
        </div>

        {syncQueue.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">
            No pending events queued. Completing lessons, submitting quizzes, adding students, or
            creating local lessons will enqueue persistent events here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-5 py-3">Event ID</th>
                  <th className="px-5 py-3">Entity</th>
                  <th className="px-5 py-3">Summary</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Retries</th>
                  <th className="px-5 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syncQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      {item.id.slice(0, 18)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">
                      {item.entityType}
                    </td>
                    <td className="px-5 py-3 text-slate-900">
                      <div>{item.summary}</div>
                      {item.lastError && (
                        <div className="mt-0.5 text-xs text-amber-800">{item.lastError}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-amber-800 font-medium whitespace-nowrap">
                      {item.status === 'failed_retained'
                        ? 'Retained (Retry Pending)'
                        : 'Pending Sync'}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600 tabular-nums">
                      {item.retryCount}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Packet Export */}
      <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Offline Learning Packets Ready for Export ({learningPackets.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {learningPackets.map((packet) => (
            <div
              key={packet.id}
              className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-slate-900">{packet.title}</div>
                <div className="text-xs text-slate-500 tabular-nums">
                  {packet.lessonIds.length} lessons · {packet.totalSizeKB} KB · v{packet.version}
                </div>
              </div>
              <button
                type="button"
                onClick={() => exportPacketJson(packet)}
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
              >
                <Download className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                Export JSON Bundle
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
