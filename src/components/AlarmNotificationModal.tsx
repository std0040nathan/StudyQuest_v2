import React, { useEffect } from 'react';
import { Quest } from '../types';
import { playAlarmSound } from '../utils/audio';

interface AlarmNotificationModalProps {
  quest: Quest | null;
  isOpen: boolean;
  onDismiss: () => void;
  onCompleteQuest: (questId: string) => void;
}

export const AlarmNotificationModal: React.FC<AlarmNotificationModalProps> = ({
  quest,
  isOpen,
  onDismiss,
  onCompleteQuest,
}) => {
  useEffect(() => {
    if (isOpen && quest) {
      playAlarmSound();
      // Repeating beep after 2.5 seconds if still open
      const interval = setInterval(() => {
        playAlarmSound();
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen, quest]);

  if (!isOpen || !quest) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onDismiss}
    >
      <div
        id="alarm-popup-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-red-300 overflow-hidden flex flex-col p-6 sm:p-8 text-center relative animate-bounce"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing background circles */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-100 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#FFF5BA] rounded-full blur-2xl pointer-events-none" />

        {/* Ringing bell icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 mb-4 animate-pulse">
          <span className="material-symbols-outlined text-[42px] animate-wiggle">
            alarm_on
          </span>
        </div>

        {/* Alarm Header */}
        <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mx-auto mb-2 border border-red-200">
          <span className="material-symbols-outlined text-[15px]">timer</span>
          <span>Task Alarm Ringing!</span>
        </div>

        <h3 className="text-2xl font-black text-[#1a1c1d] tracking-tight mb-1">
          {quest.title}
        </h3>

        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#eeedef] text-[#4c444c]">
            {quest.subject}
          </span>
          <span
            style={{
              backgroundColor: 'var(--theme-subtle)',
              color: 'var(--theme-primary)',
            }}
            className="text-xs font-semibold px-2 py-0.5 rounded-md"
          >
            Due {quest.deadlineFormatted || quest.deadline} {quest.deadlineTimeFormatted && `at ${quest.deadlineTimeFormatted}`}
          </span>
        </div>

        <p className="text-sm text-[#4c444c] font-medium bg-[#faf9fb] p-3.5 rounded-2xl border border-[#eeedef] mb-6">
          {quest.details || 'Time to tackle your assignment and keep your momentum!'}
        </p>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDismiss}
            className="py-3 px-4 rounded-xl border border-[#eeedef] hover:bg-[#faf9fb] text-xs font-bold text-[#4c444c] transition-all"
          >
            Dismiss / Snooze
          </button>
          <button
            onClick={() => {
              onCompleteQuest(quest.id);
              onDismiss();
            }}
            style={{
              backgroundColor: 'var(--theme-primary)',
            }}
            className="py-3 px-4 rounded-xl text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Finish Task (+XP)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
