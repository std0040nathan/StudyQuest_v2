import React from 'react';
import { Quest } from '../types';
import { getDeadlineUrgency, getDeadlineDateTime } from '../utils/timeUtils';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  onSelectQuest: (quest: Quest) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  quests,
  onSelectQuest,
}) => {
  if (!isOpen) return null;

  const now = new Date();

  // Filter urgent or upcoming quests and sort by nearest deadline time
  const sortedUpcoming = [...quests]
    .filter((q) => !q.isCompleted)
    .sort((a, b) => {
      const timeA = getDeadlineDateTime(a.deadline, a.deadlineTime).getTime();
      const timeB = getDeadlineDateTime(b.deadline, b.deadlineTime).getTime();
      return timeA - timeB;
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20 sm:pr-16 bg-black/30 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="notifications-modal"
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-[#e0bbe4]/30 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#eeedef] bg-[#faf9fb] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              style={{ color: 'var(--theme-primary)' }}
              className="material-symbols-outlined text-[20px]"
            >
              notifications_active
            </span>
            <h3 className="font-bold text-[#1a1c1d] text-base">Study Quests & Deadlines</h3>
          </div>
          <span
            style={{
              backgroundColor: 'var(--theme-subtle)',
              color: 'var(--theme-primary)',
            }}
            className="text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {sortedUpcoming.length} Active
          </span>
        </div>

        {/* Notifications list */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {/* Daily streak tip */}
          <div className="p-3 rounded-xl bg-[#FFF5BA]/40 border border-[#FFF5BA] flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#ca8a04] text-[20px] shrink-0 mt-0.5">
              local_fire_department
            </span>
            <div>
              <p className="text-xs font-bold text-[#1a1c1d]">Streak Active!</p>
              <p className="text-[11px] text-[#4c444c] mt-0.5">
                Check off 1 more task step to earn bonus EXP today!
              </p>
            </div>
          </div>

          {sortedUpcoming.map((q) => {
            const urgency = getDeadlineUrgency(q, now);
            return (
              <div
                key={q.id}
                onClick={() => {
                  onSelectQuest(q);
                  onClose();
                }}
                className={`p-3 rounded-xl hover:bg-black/5 border transition-all cursor-pointer group ${
                  urgency.isOverdue
                    ? 'bg-red-50/70 border-red-200'
                    : urgency.isImminent
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-[#faf9fb] border-[#eeedef]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    style={
                      !urgency.isOverdue && !urgency.isUrgent
                        ? { color: 'var(--theme-primary)' }
                        : {}
                    }
                    className={`text-[11px] font-bold flex items-center gap-1 ${
                      urgency.isOverdue
                        ? 'text-red-700 font-black'
                        : urgency.isUrgent
                        ? 'text-amber-800'
                        : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      {urgency.isOverdue ? 'error' : 'timer'}
                    </span>
                    {urgency.humanRemaining}
                  </span>
                  <span
                    style={{ color: 'var(--theme-primary)' }}
                    className="text-[10px] font-bold uppercase tracking-wider"
                  >
                    {q.subject}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#1a1c1d] group-hover:text-theme-primary truncate">
                  {q.title}
                </h4>
                <p className="text-[11px] text-[#4c444c] truncate mt-0.5">
                  Due {q.deadlineFormatted || q.deadline} {q.deadlineTimeFormatted && `at ${q.deadlineTimeFormatted}`}
                </p>
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#eeedef] bg-[#faf9fb] text-center">
          <button
            onClick={onClose}
            style={{ color: 'var(--theme-primary)' }}
            className="text-xs font-bold hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
