import React, { useState, useEffect } from 'react';
import { Quest } from '../types';
import { getDeadlineUrgency, getDeadlineDateTime } from '../utils/timeUtils';

interface DashboardProps {
  quests: Quest[];
  onOpenQuestModal: (quest: Quest) => void;
  onOpenCalendar: () => void;
  onCompleteAndRemoveQuest: (questId: string) => void;
  onToggleStepDirect: (questId: string, stepId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  quests,
  onOpenQuestModal,
  onOpenCalendar,
  onCompleteAndRemoveQuest,
  onToggleStepDirect,
}) => {
  // Live clock tracking state (refreshes every 10 seconds to keep live countdowns and urgency accurate)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Format current live time string
  const formattedLiveTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedLiveDate = currentTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Calculate today's quests: either marked isToday or whose deadline is today
  const todayQuests = quests.filter((q) => {
    if (q.isToday || q.deadlineFormatted === 'Today') return true;
    const urgency = getDeadlineUrgency(q, currentTime);
    // If due within today/24 hours or overdue, also surface on today's view
    return urgency.diffHours <= 24;
  });

  // Calculate upcoming deadlines dynamically based on time tracking:
  // All active quests sorted by closest deadline timestamp
  const sortedUpcomingQuests = [...quests].sort((a, b) => {
    const timeA = getDeadlineDateTime(a.deadline, a.deadlineTime).getTime();
    const timeB = getDeadlineDateTime(b.deadline, b.deadlineTime).getTime();
    return timeA - timeB;
  });

  return (
    <main
      id="dashboard-main-view"
      className="relative pt-20 min-h-screen overflow-hidden bg-[#faf9fb]"
    >
      {/* Immersive Background Pastel Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#ffffff]">
        <div className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] bg-[#d5e3ff]/35 rounded-full mix-blend-multiply filter blur-[120px] animate-blob" />
        <div className="absolute top-[10%] right-[-10%] w-[500px] h-[400px] bg-[#FFF5BA]/45 rounded-[40%_60%_70%_30%/40%_50%_60%_40%] mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[15%] w-[700px] h-[500px] bg-[#b5f1bc]/25 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] mix-blend-multiply filter blur-[130px] animate-blob animation-delay-4000" />
        <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-[#fcd7ff]/15 rounded-full mix-blend-multiply filter blur-[80px] animate-blob" />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-[#d5e3ff]/30 rounded-[30%_70%_70%_30%/50%_60%_40%_50%] mix-blend-multiply filter blur-[110px] animate-blob animation-delay-2000" />
      </div>

      <div className="flex flex-col w-full max-w-[1200px] mx-auto px-6 sm:px-12 lg:px-16 py-10 gap-8 relative z-10">
        {/* Top Header Row with Live Clock Tracker */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
          <div>
            <h2 className="text-3xl sm:text-[38px] font-bold text-[#1a1c1d] tracking-tight">
              Today&apos;s Reminders
            </h2>
            <p className="text-sm sm:text-base font-medium text-[#4c444c] mt-0.5">
              Finish tasks to earn EXP and clear your agenda!
            </p>
          </div>

          {/* Real-time Time Tracker pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e0bbe4]/50 shadow-xs text-xs font-bold text-[#725477]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>{formattedLiveDate} • {formattedLiveTime}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e0bbe4]/25 border border-[#e0bbe4]/50 text-xs font-bold text-[#725477]">
              <span className="material-symbols-outlined text-[16px] text-yellow-600">
                bolt
              </span>
              <span>+{todayQuests.reduce((acc, q) => acc + (q.xpReward || 100), 0)} EXP Available</span>
            </div>
          </div>
        </div>

        {/* Today's Quests 3-Column Grid */}
        {todayQuests.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/80 border border-[#e0bbe4]/30 text-center flex flex-col items-center justify-center shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#b5f1bc]/40 text-[#18512a] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[32px]">task_alt</span>
            </div>
            <h3 className="text-lg font-bold text-[#1a1c1d]">All Today&apos;s Tasks Completed!</h3>
            <p className="text-sm text-[#4c444c] max-w-md mt-1">
              You&apos;ve cleared your reminders for today and earned maximum EXP! Check upcoming deadlines below or hatch a new reminder.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {todayQuests.map((quest) => {
              const completedCount = quest.steps.filter((s) => s.completed).length;
              const totalCount = quest.steps.length;
              const progress =
                totalCount === 0
                  ? 0
                  : Math.round((completedCount / totalCount) * 100);

              const urgency = getDeadlineUrgency(quest, currentTime);

              // Determine card accent and icons based on type
              const isHomework = quest.type.toLowerCase().includes('homework');
              const isTest =
                quest.type.toLowerCase().includes('test') || quest.type.toLowerCase().includes('quiz') || quest.type.toLowerCase().includes('exam');

              const accentBorderColor = urgency.isOverdue
                ? 'bg-[#ba1a1a]'
                : urgency.isImminent
                ? 'bg-amber-400'
                : isHomework
                ? 'bg-[#d5e3ff]'
                : isTest
                ? 'bg-[#FFF5BA]'
                : 'bg-[#fcd7ff]';

              const badgeStyle = isHomework
                ? 'bg-[#d5e3ff] text-[#001c3b]'
                : isTest
                ? 'bg-[#FFF5BA] text-[#1a1c1d]'
                : 'bg-[#fcd7ff] text-[#2a1131]';

              const typeIcon = isHomework ? 'menu_book' : isTest ? 'edit_note' : 'task';

              const iconColor = isHomework
                ? 'text-[#445f89]'
                : isTest
                ? 'text-yellow-700'
                : 'text-[#725477]';

              return (
                <div
                  key={quest.id}
                  id={`quest-card-${quest.id}`}
                  className="bg-white rounded-2xl p-6 relative overflow-hidden transition-all duration-300 border border-[#e0bbe4]/25 shadow-[0_8px_30px_rgba(114,84,119,0.08)] hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(114,84,119,0.12)] flex flex-col justify-between"
                >
                  {/* Accent vertical bar on left edge */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${accentBorderColor}`} />

                  {/* Top Badges & Finish Button */}
                  <div>
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold tracking-wide ${badgeStyle}`}>
                          {quest.subject}
                        </span>
                        <span className="text-[11px] font-bold text-[#725477] bg-[#e0bbe4]/20 px-2 py-0.5 rounded-md">
                          +{quest.xpReward || 100} EXP
                        </span>
                      </div>

                      {/* Quick Finish & Delete check button */}
                      <button
                        onClick={() => onCompleteAndRemoveQuest(quest.id)}
                        title="Finish task & claim EXP"
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-[#faf9fb] border border-[#eeedef] hover:bg-[#b5f1bc] hover:text-[#18512a] hover:border-[#b5f1bc] text-[#cfc3cc] group/done"
                      >
                        <span className="material-symbols-outlined text-[18px] group-hover/done:scale-110 transition-transform">
                          check
                        </span>
                      </button>
                    </div>

                    {/* Deadline Date, Live Countdown, and Alarm badge */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap text-xs text-[#4c444c]">
                      {/* Live Time Tracking Badge */}
                      <span
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded font-bold transition-colors ${
                          urgency.isOverdue
                            ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                            : urgency.isImminent
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : urgency.isUrgent
                            ? 'bg-orange-50 text-orange-800 border border-orange-200 font-semibold'
                            : 'bg-[#eeedef]/80 text-[#4c444c] font-medium'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {urgency.isOverdue ? 'error' : 'timer'}
                        </span>
                        <span>{urgency.humanRemaining}</span>
                      </span>

                      {quest.deadlineTimeFormatted && (
                        <span className="text-[11px] font-medium text-[#4c444c] bg-[#eeedef] px-2 py-0.5 rounded">
                          {quest.deadlineTimeFormatted}
                        </span>
                      )}

                      {quest.hasAlarm && (
                        <span className="flex items-center gap-1 bg-[#FFF5BA] text-yellow-900 border border-yellow-300 px-2 py-0.5 rounded font-bold">
                          <span className="material-symbols-outlined text-[14px] text-yellow-700">
                            alarm
                          </span>
                          <span>{quest.alarmTimeFormatted || 'Alarm'}</span>
                        </span>
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3
                        onClick={() => onOpenQuestModal(quest)}
                        className="text-xl font-bold cursor-pointer hover:text-[#725477] transition-colors leading-tight text-[#1a1c1d]"
                      >
                        {quest.title}
                      </h3>
                      <span className={`material-symbols-outlined text-[24px] shrink-0 ${iconColor}`}>
                        {typeIcon}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-[#4c444c] mb-4 line-clamp-2">
                      {quest.details}
                    </p>

                    {/* Interactive Quick Sub-steps Checklists */}
                    {quest.steps.length > 0 && (
                      <div className="mb-4 space-y-1.5 pt-2 border-t border-[#eeedef]/60">
                        {quest.steps.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => onToggleStepDirect(quest.id, st.id)}
                            className="flex items-center gap-2.5 text-xs text-[#4c444c] hover:text-[#1a1c1d] cursor-pointer group/step py-0.5"
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => {}} // handled by wrapper click
                              className="w-4 h-4 rounded text-[#725477] accent-[#725477] cursor-pointer pointer-events-none transition-transform group-hover/step:scale-110"
                            />
                            <span
                              className={`truncate ${
                                st.completed ? 'line-through text-[#4c444c]/50' : 'font-medium'
                              }`}
                            >
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action & Progress Bar */}
                  <div className="pt-3 border-t border-[#eeedef]/70 flex flex-col gap-2.5">
                    {/* Progress info */}
                    <div
                      onClick={() => onOpenQuestModal(quest)}
                      className="flex items-center justify-between text-xs font-bold text-[#4c444c] cursor-pointer"
                    >
                      <span>Progress</span>
                      <span className="text-[#445f89]">{progress}%</span>
                    </div>

                    {/* Progress bar */}
                    <div
                      onClick={() => onOpenQuestModal(quest)}
                      className="h-2 bg-[#eeedef] rounded-full overflow-hidden cursor-pointer"
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[#b1cdfd]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Finish & Delete CTA Button */}
                    <button
                      onClick={() => onCompleteAndRemoveQuest(quest.id)}
                      id={`btn-finish-quest-${quest.id}`}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-98 flex items-center justify-center gap-1.5 shadow-xs bg-[#725477] text-white hover:bg-[#593d5f]"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        task_alt
                      </span>
                      <span>Finish & Claim (+{quest.xpReward || 100} EXP)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upcoming Deadlines Section with Time Tracking */}
        <div className="flex items-baseline justify-between mb-1 mt-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-[#1a1c1d] tracking-tight">
                Upcoming Deadlines
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e0bbe4]/30 text-xs font-bold text-[#725477]">
                {sortedUpcomingQuests.length} Tracked
              </span>
            </div>
            <p className="text-xs text-[#4c444c] font-medium">
              Automatically sorted by nearest deadline so you never miss homework or tests!
            </p>
          </div>
          <button
            id="btn-view-calendar"
            onClick={onOpenCalendar}
            className="text-[#725477] text-sm font-bold hover:underline flex items-center gap-1 group transition-all"
          >
            <span>View Calendar</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>

        {/* Upcoming Deadlines List Card with dynamic countdowns */}
        <div
          id="upcoming-deadlines-container"
          className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(114,84,119,0.05)] p-3 sm:p-5 border border-[#e0bbe4]/20 space-y-1.5"
        >
          {sortedUpcomingQuests.length === 0 ? (
            <div className="text-center py-6 text-sm text-[#4c444c] font-medium">
              No upcoming future deadlines. You&apos;re completely caught up!
            </div>
          ) : (
            sortedUpcomingQuests.map((quest, index) => {
              const urgency = getDeadlineUrgency(quest, currentTime);
              const isGreen = index % 2 === 0;
              const dayBadgeBg = urgency.isOverdue
                ? 'bg-red-100 text-red-800'
                : urgency.isImminent
                ? 'bg-amber-100 text-amber-900'
                : isGreen
                ? 'bg-[#b5f1bc]/45 text-[#18512a]'
                : 'bg-[#d5e3ff]/45 text-[#2b4770]';

              return (
                <div
                  key={quest.id}
                  id={`upcoming-item-${quest.id}`}
                  className={`flex items-center p-3.5 sm:p-4 rounded-xl group transition-all hover:bg-[#e0bbe4]/10 ${
                    urgency.isOverdue
                      ? 'bg-red-50/50 border border-red-200'
                      : urgency.isImminent
                      ? 'bg-amber-50/50 border border-amber-200'
                      : 'bg-white'
                  }`}
                >
                  {/* Complete & Delete Checkbox */}
                  <button
                    onClick={() => onCompleteAndRemoveQuest(quest.id)}
                    title="Finish task & claim EXP"
                    className="w-7 h-7 rounded-lg mr-3 flex items-center justify-center transition-colors shrink-0 border-2 border-[#cfc3cc] hover:border-[#725477] hover:bg-[#b5f1bc] text-transparent hover:text-[#18512a]"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </button>

                  {/* Day Square Badge */}
                  <div
                    onClick={() => onOpenQuestModal(quest)}
                    className={`w-12 h-12 rounded-xl ${dayBadgeBg} flex flex-col items-center justify-center mr-4 shrink-0 transform group-hover:scale-105 transition-transform shadow-xs cursor-pointer`}
                  >
                    <span className="font-bold text-lg leading-none">
                      {quest.deadlineDay || quest.deadline.slice(-2)}
                    </span>
                    <span className="text-[10px] font-semibold uppercase opacity-80">
                      {quest.deadlineFormatted?.split(' ')[0] || 'Day'}
                    </span>
                  </div>

                  {/* Title & Details */}
                  <div
                    onClick={() => onOpenQuestModal(quest)}
                    className="flex-1 min-w-0 pr-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold truncate group-hover:text-[#725477] transition-colors text-[#1a1c1d]">
                        {quest.title}
                      </h4>

                      {/* Dynamic Time Tracking Pill */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          urgency.isOverdue
                            ? 'bg-red-200 text-red-900 animate-pulse'
                            : urgency.isImminent
                            ? 'bg-amber-200 text-amber-950 font-black'
                            : urgency.isUrgent
                            ? 'bg-orange-100 text-orange-900'
                            : 'bg-[#eeedef] text-[#4c444c]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {urgency.isOverdue ? 'schedule' : 'timer'}
                        </span>
                        {urgency.humanRemaining}
                      </span>

                      {quest.deadlineTimeFormatted && (
                        <span className="text-[11px] font-semibold text-[#4c444c] bg-[#eeedef] px-2 py-0.5 rounded">
                          {quest.deadlineTimeFormatted}
                        </span>
                      )}

                      {quest.hasAlarm && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-800 bg-yellow-100 px-1.5 py-0.5 rounded border border-yellow-300">
                          <span className="material-symbols-outlined text-[12px]">alarm</span>
                          {quest.alarmTimeFormatted}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-[#4c444c] truncate">
                      {quest.details}
                    </p>
                  </div>

                  {/* Subject Tag & Arrow */}
                  <div
                    onClick={() => onOpenQuestModal(quest)}
                    className="flex items-center gap-3 shrink-0 cursor-pointer"
                  >
                    <span className="px-3 py-1 rounded-full bg-[#eeedef] text-[#1a1c1d] text-xs font-bold hidden sm:inline-block">
                      {quest.subject}
                    </span>
                    <span className="text-xs font-bold text-[#725477] hidden md:inline-block">
                      +{quest.xpReward || 100} EXP
                    </span>
                    <span className="material-symbols-outlined text-[#cfc3cc] group-hover:text-[#725477] group-hover:translate-x-0.5 transition-all text-[22px]">
                      chevron_right
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
};
