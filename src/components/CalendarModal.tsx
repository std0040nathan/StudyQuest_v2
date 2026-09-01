import React from 'react';
import { Quest } from '../types';
import { getDeadlineUrgency, getDeadlineDateTime } from '../utils/timeUtils';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  onSelectQuest: (quest: Quest) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  quests,
  onSelectQuest,
}) => {
  if (!isOpen) return null;

  const now = new Date();

  // Sort upcoming quests by exact deadline timestamp
  const sortedQuests = [...quests].sort((a, b) => {
    const timeA = getDeadlineDateTime(a.deadline, a.deadlineTime).getTime();
    const timeB = getDeadlineDateTime(b.deadline, b.deadlineTime).getTime();
    return timeA - timeB;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="calendar-modal"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e0bbe4]/30 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#eeedef] bg-[#faf9fb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--theme-subtle)',
                color: 'var(--theme-primary)',
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a1c1d]">Schedule & Deadlines</h3>
              <p className="text-xs font-medium text-[#4c444c]">
                Live time tracking across all homework, tests, and projects
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close calendar modal"
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#4c444c] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {sortedQuests.length === 0 ? (
            <div className="text-center py-10 text-[#4c444c]">No scheduled tasks yet!</div>
          ) : (
            sortedQuests.map((q) => {
              const completedSteps = q.steps.filter((s) => s.completed).length;
              const totalSteps = q.steps.length;
              const percent =
                totalSteps === 0 ? (q.isCompleted ? 100 : 0) : Math.round((completedSteps / totalSteps) * 100);

              const urgency = getDeadlineUrgency(q, now);

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    onSelectQuest(q);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-4 ${
                    urgency.isOverdue
                      ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                      : urgency.isImminent
                      ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                      : 'bg-[#faf9fb] hover:bg-black/5 border-[#eeedef]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      style={
                        !urgency.isOverdue && !urgency.isImminent
                          ? { backgroundColor: 'var(--theme-subtle)', color: 'var(--theme-primary)' }
                          : {}
                      }
                      className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                        urgency.isOverdue
                          ? 'bg-red-100 text-red-800'
                          : urgency.isImminent
                          ? 'bg-amber-100 text-amber-900'
                          : ''
                      }`}
                    >
                      <span className="text-base leading-none">
                        {q.deadlineDay || q.deadline.slice(-2)}
                      </span>
                      <span className="text-[10px] uppercase font-semibold">
                        {q.deadlineFormatted?.split(' ')[0] || 'Day'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          style={{ color: 'var(--theme-primary)' }}
                          className="text-xs font-bold"
                        >
                          {q.subject}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#4c444c] font-semibold border border-[#eeedef]">
                          {q.type}
                        </span>

                        {/* Urgency countdown badge */}
                        <span
                          style={
                            !urgency.isOverdue && !urgency.isUrgent
                              ? { color: 'var(--theme-primary)', borderColor: 'var(--theme-subtle-border)' }
                              : {}
                          }
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            urgency.isOverdue
                              ? 'bg-red-200 text-red-900'
                              : urgency.isUrgent
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-white border'
                          }`}
                        >
                          {urgency.humanRemaining}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#1a1c1d] group-hover:text-theme-primary truncate mt-0.5">
                        {q.title}
                      </h4>
                      {q.deadlineTimeFormatted && (
                        <p className="text-[11px] text-[#4c444c] font-medium">
                          Due at {q.deadlineTimeFormatted}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold text-[#4c444c]">{percent}% Done</div>
                      <div className="w-16 h-1.5 bg-[#eeedef] rounded-full overflow-hidden mt-1">
                        <div
                          style={{
                            width: `${percent}%`,
                            backgroundColor: 'var(--theme-primary)',
                          }}
                          className="h-full rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#cfc3cc] group-hover:text-theme-primary group-hover:translate-x-1 transition-all">
                      chevron_right
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#eeedef] bg-[#faf9fb] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#e0bbe4] hover:bg-[#dfbbe4] text-[#66496b] font-bold text-sm rounded-xl transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
