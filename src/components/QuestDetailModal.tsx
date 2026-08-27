import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Quest, QuestStep } from '../types';
import { playAlarmSound } from '../utils/audio';

interface QuestDetailModalProps {
  quest: Quest | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStep: (questId: string, stepId: string) => void;
  onAddStep: (questId: string, stepTitle: string) => void;
  onDeleteStep: (questId: string, stepId: string) => void;
  onCompleteAndRemoveQuest: (questId: string) => void;
  onDeleteQuest?: (questId: string) => void;
}

export const QuestDetailModal: React.FC<QuestDetailModalProps> = ({
  quest,
  isOpen,
  onClose,
  onToggleStep,
  onAddStep,
  onDeleteStep,
  onCompleteAndRemoveQuest,
  onDeleteQuest,
}) => {
  const [newStepText, setNewStepText] = useState('');

  if (!isOpen || !quest) return null;

  const totalSteps = quest.steps.length;
  const completedSteps = quest.steps.filter((s) => s.completed).length;
  const progressPercent =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    onAddStep(quest.id, newStepText.trim());
    setNewStepText('');
  };

  const handleStepClick = (step: QuestStep) => {
    onToggleStep(quest.id, step.id);
    if (!step.completed) {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#e0bbe4', '#b1cdfd', '#FFF5BA', '#9ad5a2'],
      });
    }
  };

  const handleCompleteAndFinish = () => {
    onCompleteAndRemoveQuest(quest.id);
    onClose();
  };

  // Color mappings
  const typeBadgeColors =
    quest.type.toLowerCase().includes('homework')
      ? 'bg-[#d5e3ff] text-[#001c3b]'
      : quest.type.toLowerCase().includes('test') || quest.type.toLowerCase().includes('quiz')
      ? 'bg-[#FFF5BA] text-[#1a1c1d]'
      : 'bg-[#fcd7ff] text-[#2a1131]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="quest-detail-modal"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#e0bbe4]/30 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#eeedef] bg-[#faf9fb] flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeBadgeColors}`}>
                {quest.type}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#eeedef] text-[#4c444c]">
                {quest.subject}
              </span>
              <span className="text-xs font-medium text-[#725477] bg-[#e0bbe4]/25 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                Due: {quest.deadlineFormatted || quest.deadline} {quest.deadlineTimeFormatted && `at ${quest.deadlineTimeFormatted}`}
              </span>
              {quest.hasAlarm && (
                <span className="text-xs font-bold text-yellow-900 bg-[#FFF5BA] border border-yellow-300 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-yellow-700">alarm</span>
                  Alarm: {quest.alarmTimeFormatted}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-[#1a1c1d] tracking-tight">{quest.title}</h3>
            {quest.details && (
              <p className="text-sm font-medium text-[#4c444c] mt-1">{quest.details}</p>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#4c444c] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body: Progress & Checklist */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Progress Card */}
          <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-[#4c444c] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#725477]">
                  checklist
                </span>
                Sub-steps Checked ({completedSteps}/{totalSteps})
              </span>
              <span className="font-bold text-[#725477] text-base">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-[#eeedef] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#b1cdfd] to-[#e0bbe4] rounded-full transition-all duration-500 relative"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Alarm Details Card if Set */}
          {quest.hasAlarm && (
            <div className="p-3.5 rounded-2xl bg-[#FFF5BA]/30 border border-yellow-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-700 text-[20px]">
                  alarm_on
                </span>
                <div>
                  <div className="text-xs font-bold text-yellow-900">Study Reminder Alarm</div>
                  <div className="text-[11px] text-yellow-800">
                    Set for {quest.alarmTimeFormatted || quest.alarmTime}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => playAlarmSound()}
                className="px-3 py-1 rounded-lg bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-bold text-xs transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">volume_up</span>
                Test
              </button>
            </div>
          )}

          {/* Sub-steps Checklist */}
          <div>
            <h4 className="text-sm font-bold text-[#1a1c1d] mb-3 flex items-center justify-between">
              <span>Steps to Conquer (+25 EXP each)</span>
              <span className="text-xs font-normal text-[#725477]">Checking all finishes quest</span>
            </h4>

            {quest.steps.length === 0 ? (
              <div className="text-center py-6 px-4 bg-[#faf9fb] rounded-2xl border border-dashed border-[#cfc3cc]">
                <span className="material-symbols-outlined text-3xl text-[#725477]/40 mb-1">
                  task_alt
                </span>
                <p className="text-sm text-[#4c444c] font-medium">No sub-steps added yet.</p>
                <p className="text-xs text-[#725477]">Break down this project into smaller bite-sized steps below!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quest.steps.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                      step.completed
                        ? 'bg-[#f4f3f5]/70 border-[#e3e2e4] text-[#4c444c]'
                        : 'bg-white border-[#eeedef] hover:border-[#e0bbe4] shadow-xs'
                    }`}
                  >
                    <label className="flex items-center gap-3 flex-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={step.completed}
                        onChange={() => handleStepClick(step)}
                        className="w-5 h-5 rounded-md text-[#725477] border-2 border-[#cfc3cc] focus:ring-[#e0bbe4] cursor-pointer accent-[#725477] transition-transform active:scale-125"
                      />
                      <span
                        className={`text-sm font-medium ${
                          step.completed
                            ? 'line-through text-[#4c444c]/60'
                            : 'text-[#1a1c1d]'
                        }`}
                      >
                        {step.title}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => onDeleteStep(quest.id, step.id)}
                      className="text-[#cfc3cc] hover:text-[#ba1a1a] p-1 rounded-md transition-colors"
                      title="Remove step"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Step Form */}
            <form onSubmit={handleAddStepSubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                placeholder="+ Add a new step / checkpoint..."
                className="flex-1 px-4 py-2.5 text-sm bg-[#faf9fb] border border-[#eeedef] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e0bbe4] focus:bg-white placeholder:text-[#4c444c]/40 font-medium"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#e0bbe4] hover:bg-[#dfbbe4] text-[#66496b] font-bold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-[#eeedef] bg-[#faf9fb] flex items-center justify-between">
          {onDeleteQuest && (
            <button
              onClick={() => {
                if (window.confirm('Delete this reminder?')) {
                  onDeleteQuest(quest.id);
                  onClose();
                }
              }}
              className="text-xs font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              Delete Reminder
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#4c444c] hover:bg-black/5 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCompleteAndFinish}
              className="px-5 py-2.5 text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 bg-[#725477] text-white hover:bg-[#593d5f]"
            >
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              <span>Finish Task & Claim (+{quest.xpReward || 100} EXP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
