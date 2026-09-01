import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Quest, QuestStep, QuestType, SchoolSubject } from '../types';
import { playAlarmSound } from '../utils/audio';

interface CreateQuestProps {
  onCreateQuest: (quest: Quest) => void;
  onNavigateDashboard: () => void;
}

const SCHOOL_SUBJECTS: SchoolSubject[] = [
  'Math',
  'English',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Chinese',
  'Bahasa Indo',
  'Computer Science (CS)',
  'History',
  'Geography',
  'Art',
  'Music',
  'Economics',
  'Physical Education (PE)',
  'Other',
];

const POPULAR_OTHER_SUBJECTS = [
  'Social Studies',
  'Accounting',
  'Business Studies',
  'Psychology',
  'Robotics',
  'Literature',
  'Design & Tech',
  'Philosophy',
  'Spanish',
  'German',
  'Drama / Theater',
  'Statistics',
];

const formatTime12h = (time24: string) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
};

export const CreateQuest: React.FC<CreateQuestProps> = ({
  onCreateQuest,
  onNavigateDashboard,
}) => {
  const [missionTitle, setMissionTitle] = useState('');
  const [subject, setSubject] = useState<SchoolSubject>('Math');
  const [customSubject, setCustomSubject] = useState('');
  const [questType, setQuestType] = useState<QuestType>('Homework');
  const [deadline, setDeadline] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('16:00');
  const [details, setDetails] = useState('');
  const [isTodayQuest, setIsTodayQuest] = useState(true);

  // Alarm state
  const [hasAlarm, setHasAlarm] = useState(true);
  const [alarmTime, setAlarmTime] = useState('15:30');

  // Sub-steps list
  const [steps, setSteps] = useState<string[]>([
    'Review chapter materials & assignment guidelines',
    'Complete core questions / assignment draft',
  ]);
  const [newStepInput, setNewStepInput] = useState('');

  // Submit button state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const quickTypes = ['Homework', 'Test', 'Project', 'Quiz', 'Assignment', 'Exam'];

  const handleAddStep = () => {
    if (!newStepInput.trim()) return;
    setSteps([...steps, newStepInput.trim()]);
    setNewStepInput('');
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleTestAlarm = () => {
    playAlarmSound();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const chosenSubject = subject === 'Other'
      ? (customSubject.trim() || 'Other')
      : (customSubject.trim() || subject);

    const dateObj = deadline ? new Date(deadline + 'T00:00:00') : new Date();
    const dayNum = dateObj.getDate();
    const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
    const formattedDeadline = deadline ? `${monthName} ${dayNum}` : 'Soon';
    const formattedDeadlineTime = deadlineTime ? formatTime12h(deadlineTime) : '11:59 PM';
    const formattedAlarmTime = hasAlarm && alarmTime ? formatTime12h(alarmTime) : undefined;

    const questSteps: QuestStep[] = steps.map((s, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      title: s,
      completed: false,
    }));

    const newQuest: Quest = {
      id: `quest-${Date.now()}`,
      title: missionTitle.trim(),
      subject: chosenSubject,
      type: questType,
      deadline: deadline || new Date().toISOString().split('T')[0],
      deadlineDay: dayNum,
      deadlineFormatted: formattedDeadline,
      deadlineTime: deadlineTime || '23:59',
      deadlineTimeFormatted: formattedDeadlineTime,
      hasAlarm,
      alarmTime: hasAlarm ? alarmTime : undefined,
      alarmTimeFormatted: formattedAlarmTime,
      details: details.trim() || `${chosenSubject} quest`,
      steps: questSteps,
      isCompleted: false,
      isToday: isTodayQuest,
      colorTheme: questType.toLowerCase().includes('test')
        ? 'yellow'
        : questType.toLowerCase().includes('homework')
        ? 'blue'
        : 'purple',
      xpReward: 150,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setSubmitSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#725477', '#e0bbe4', '#b1cdfd', '#FFF5BA', '#9ad5a2'],
      });

      setTimeout(() => {
        onCreateQuest(newQuest);
        onNavigateDashboard();
      }, 800);
    }, 600);
  };

  return (
    <main
      id="create-quest-main-view"
      className="relative pt-20 min-h-screen overflow-hidden bg-[#faf9fb] flex justify-center"
    >
      {/* Immersive Background Pastel Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg
          className="absolute top-[-15%] left-[-10%] w-[900px] h-[900px] opacity-30 fill-[#d5e3ff] bg-blob-1"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M44.7,-76.4C58.1,-69.2,69.3,-57.4,77.3,-43.7C85.3,-30,90.1,-15,88.9,-0.7C87.7,13.6,80.5,27.2,71.3,38.9C62.1,50.6,50.9,60.4,38.1,68.1C25.3,75.8,10.9,81.4,-3.1,86.8C-17.1,92.2,-30.7,97.4,-43.1,93.1C-55.5,88.8,-66.7,75,-74.8,60.3C-82.9,45.6,-87.9,30,-89.8,14.1C-91.7,-1.8,-90.5,-18,-83.8,-32.1C-77.1,-46.2,-64.9,-58.2,-51.1,-65.2C-37.3,-72.2,-21.9,-74.2,-5.3,-65C11.3,-55.8,22.6,-63.6,44.7,-76.4Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute top-[15%] right-[-15%] w-[1000px] h-[1000px] opacity-45 fill-[#b5f1bc] bg-blob-2"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M38.1,-65.1C50.3,-58.4,61.8,-49.5,70.1,-38.1C78.4,-26.7,83.5,-12.8,82.4,0.6C81.3,14.1,74,27.1,65.1,38.8C56.2,50.5,45.7,60.9,33.4,68.1C21.1,75.3,7,79.3,-7.4,78.6C-21.8,77.9,-36.5,72.5,-48.9,63.8C-61.3,55.1,-71.4,43.1,-77.1,29.4C-82.8,15.7,-84.1,0.3,-81.1,-14.1C-78.1,-28.5,-70.8,-41.9,-60.1,-49.1C-49.4,-56.3,-35.3,-57.3,-23.1,-64C-10.9,-70.7,-0.6,-83.1,11.1,-82.4C22.8,-81.7,38.1,-65.1,38.1,-65.1Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute bottom-[-20%] left-[5%] w-[1100px] h-[1100px] opacity-25 fill-[#fcd7ff] bg-blob-3"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M42.2,-72.8C54.9,-66.4,65.6,-55.4,73.1,-42.5C80.6,-29.6,84.9,-14.8,84.1,-0.5C83.3,13.8,77.4,27.6,69.1,39.4C60.8,51.2,50.1,61,37.7,68.1C25.3,75.2,11.2,79.6,-3.1,85C-17.4,90.4,-31.9,96.8,-44.8,93.1C-57.7,89.4,-69,75.6,-76.8,60.8C-84.6,46,-88.9,30.2,-90.4,14.1C-91.9,-2,-90.6,-18.4,-84.1,-32.8C-77.6,-47.2,-65.9,-59.6,-52.1,-65.5C-38.3,-71.4,-22.4,-70.8,-6.1,-60.2C10.2,-49.6,29.5,-79.2,42.2,-72.8Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="flex flex-col w-full max-w-3xl items-center px-6 sm:px-12 py-10 relative z-10">
        {/* White Card Container */}
        <div
          id="create-quest-card"
          className="w-full bg-white/95 rounded-3xl shadow-xl border border-[#e0bbe4]/30 p-8 sm:p-12 relative overflow-hidden backdrop-blur-md"
        >
          {/* Decorative Corner Glows */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#fcd7ff]/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#dfbbe4]/30 rounded-full blur-3xl pointer-events-none" />

          {/* Fun Top Right Badge */}
          <div
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-subtle-border)',
              color: 'var(--theme-primary)',
            }}
            className="absolute top-8 right-8 hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full border shadow-xs"
          >
            <span
              style={{ color: 'var(--theme-primary)' }}
              className="material-symbols-outlined text-[18px]"
            >
              stars
            </span>
            <span className="text-xs font-bold">+150 EXP on Finish!</span>
          </div>

          {/* Title and Subtitle */}
          <div className="relative z-10 flex flex-col gap-2 mb-8 mt-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a1c1d] tracking-tight">
              Hatch a New Quest!
            </h2>
            <p className="text-base sm:text-lg font-medium text-[#4c444c]">
              Set your homework, deadline, and study quest.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">
            {/* Mission / Task Title */}
            <div className="flex flex-col gap-2 group">
              <label
                htmlFor="subject"
                className="text-xs font-bold text-[#4c444c] group-focus-within:text-theme-primary transition-colors"
              >
                Task Title / Assignment Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4c444c]/50 group-focus-within:text-theme-primary transition-colors text-[20px]">
                  edit_note
                </span>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={missionTitle}
                  onChange={(e) => setMissionTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Math Exercises, CS Coding Lab..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#f4f3f5] text-[#1a1c1d] text-base font-medium focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:bg-white transition-all shadow-xs placeholder:text-[#4c444c]/40 border border-transparent focus:border-theme-primary"
                />
              </div>

              {/* School Subjects Selector */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <span
                    style={{ color: 'var(--theme-primary)' }}
                    className="text-xs font-bold"
                  >
                    Select School Subject:
                  </span>
                  {subject === 'Other' && (
                    <span
                      style={{
                        backgroundColor: 'var(--theme-subtle)',
                        color: 'var(--theme-primary)',
                      }}
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    >
                      Custom Subject Mode
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {SCHOOL_SUBJECTS.map((sub) => {
                    const isOther = sub === 'Other';
                    const isSelected = isOther ? subject === 'Other' : subject === sub && !customSubject;

                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => {
                          setSubject(sub);
                          if (!isOther) {
                            setCustomSubject('');
                          }
                        }}
                        style={
                          isSelected
                            ? { backgroundColor: 'var(--theme-primary)', color: '#ffffff' }
                            : {}
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 ${
                          isSelected
                            ? 'shadow-md'
                            : 'bg-[#eeedef] text-[#4c444c] hover:bg-black/5'
                        }`}
                      >
                        {isOther && (
                          <span className="material-symbols-outlined text-[15px]">
                            more_horiz
                          </span>
                        )}
                        <span>{sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom "Other" Subject Input Box & Quick Elective Suggestions */}
                {subject === 'Other' && (
                  <div
                    style={{
                      borderColor: 'var(--theme-subtle-border)',
                    }}
                    className="mt-2 p-3.5 rounded-2xl bg-[#faf9fb] border space-y-3 animate-fadeIn"
                  >
                    <div>
                      <label
                        style={{ color: 'var(--theme-primary)' }}
                        className="block text-xs font-bold mb-1"
                      >
                        Enter Custom Subject Name:
                      </label>
                      <div className="relative">
                        <span
                          style={{ color: 'var(--theme-primary)' }}
                          className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]"
                        >
                          auto_awesome
                        </span>
                        <input
                          type="text"
                          autoFocus
                          value={customSubject}
                          onChange={(e) => setCustomSubject(e.target.value)}
                          placeholder="e.g. Psychology, Accounting, Robotics, Biology..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#eeedef] focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/30 outline-none text-xs sm:text-sm text-[#1a1c1d] font-semibold transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Quick popular electives chips */}
                    <div>
                      <span className="text-[11px] font-bold text-[#4c444c] block mb-1.5">
                        Quick Suggestions:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {POPULAR_OTHER_SUBJECTS.map((popSub) => (
                          <button
                            type="button"
                            key={popSub}
                            onClick={() => setCustomSubject(popSub)}
                            style={
                              customSubject.toLowerCase() === popSub.toLowerCase()
                                ? { backgroundColor: 'var(--theme-primary)', color: '#ffffff' }
                                : {}
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              customSubject.toLowerCase() === popSub.toLowerCase()
                                ? 'font-bold shadow-xs'
                                : 'bg-white text-[#4c444c] border border-[#eeedef] hover:bg-black/5'
                            }`}
                          >
                            + {popSub}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quest Type */}
            <div className="flex flex-col gap-2 group">
              <label
                htmlFor="tor"
                className="text-xs font-bold text-[#4c444c] group-focus-within:text-theme-primary transition-colors"
              >
                Quest Category / Type
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {quickTypes.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setQuestType(t)}
                    style={
                      questType === t
                        ? { backgroundColor: 'var(--theme-subtle)', color: 'var(--theme-primary)', borderColor: 'var(--theme-subtle-border)' }
                        : {}
                    }
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all border ${
                      questType === t
                        ? 'shadow-xs font-bold'
                        : 'bg-[#eeedef] text-[#4c444c] border-transparent hover:bg-black/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Deadline Date & Deadline Time (2-Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-[#faf9fb] p-4 sm:p-5 rounded-2xl border border-[#eeedef]">
              {/* Deadline Date */}
              <div className="flex flex-col gap-1.5 group">
                <label
                  htmlFor="dueDate"
                  className="text-xs font-bold text-[#4c444c] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#725477]">
                    calendar_month
                  </span>
                  <span>Deadline Date</span>
                </label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white text-[#1a1c1d] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#725477]/40 shadow-xs cursor-pointer border border-[#eeedef]"
                />
              </div>

              {/* Deadline Time */}
              <div className="flex flex-col gap-1.5 group">
                <label
                  htmlFor="dueTime"
                  className="text-xs font-bold text-[#4c444c] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#725477]">
                    schedule
                  </span>
                  <span>Deadline Time ({deadlineTime ? formatTime12h(deadlineTime) : 'None'})</span>
                </label>
                <input
                  id="dueTime"
                  name="dueTime"
                  type="time"
                  required
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white text-[#1a1c1d] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#725477]/40 shadow-xs cursor-pointer border border-[#eeedef]"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-1 border-t border-[#eeedef]">
                <label className="flex items-center gap-2 text-xs font-bold text-[#4c444c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTodayQuest}
                    onChange={(e) => setIsTodayQuest(e.target.checked)}
                    className="w-4 h-4 rounded text-[#725477] accent-[#725477] cursor-pointer"
                  />
                  <span>Show on Today&apos;s Quests board</span>
                </label>

                {/* Quick time shortcuts */}
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-[#725477] font-semibold">Quick Time:</span>
                  <button
                    type="button"
                    onClick={() => setDeadlineTime('15:30')}
                    className="px-2 py-0.5 rounded bg-white hover:bg-[#e0bbe4]/20 border border-[#eeedef] text-[#4c444c] font-medium"
                  >
                    3:30 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeadlineTime('23:59')}
                    className="px-2 py-0.5 rounded bg-white hover:bg-[#e0bbe4]/20 border border-[#eeedef] text-[#4c444c] font-medium"
                  >
                    11:59 PM
                  </button>
                </div>
              </div>
            </div>

            {/* Alarm Settings Option */}
            <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-[#FFF5BA]/30 border border-yellow-200">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1a1c1d] cursor-pointer">
                  <span className="material-symbols-outlined text-yellow-700 text-[22px]">
                    alarm
                  </span>
                  <span>Set Study Reminder Alarm</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestAlarm}
                    title="Test alarm sound"
                    className="text-[11px] font-bold text-yellow-800 bg-yellow-100 hover:bg-yellow-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">volume_up</span>
                    Test Sound
                  </button>
                  <input
                    type="checkbox"
                    checked={hasAlarm}
                    onChange={(e) => setHasAlarm(e.target.checked)}
                    className="w-5 h-5 rounded text-[#725477] accent-[#725477] cursor-pointer"
                  />
                </div>
              </div>

              {hasAlarm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-yellow-200/60 items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-yellow-900">Alarm Alert Time:</span>
                    <input
                      type="time"
                      value={alarmTime}
                      onChange={(e) => setAlarmTime(e.target.value)}
                      className="h-10 px-3 rounded-xl bg-white text-sm font-bold text-[#1a1c1d] border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  <div className="text-xs text-yellow-900 font-medium">
                    🔔 Alarm will sound at <span className="font-bold">{formatTime12h(alarmTime)}</span> with pleasant audio alert & notification popup.
                  </div>
                </div>
              )}
            </div>

            {/* Detail Notes */}
            <div className="flex flex-col gap-2 group">
              <label
                htmlFor="detail"
                className="text-xs font-bold text-[#4c444c] group-focus-within:text-[#725477] transition-colors"
              >
                Task Details & Notes
              </label>
              <textarea
                id="detail"
                name="detail"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Specific instructions, problem numbers, rubric criteria..."
                className="w-full p-4 rounded-xl bg-[#f4f3f5] text-[#1a1c1d] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#725477]/40 focus:bg-white transition-all shadow-xs placeholder:text-[#4c444c]/40 resize-none border border-transparent focus:border-[#e0bbe4]"
              />
            </div>

            {/* Sub-steps & Checkpoints tracker builder */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#4c444c] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#725477]">
                    checklist
                  </span>
                  Sub-step Checkpoints ({steps.length})
                </label>
                <span className="text-[11px] text-[#725477] font-medium">
                  Earn +25 EXP per checked step
                </span>
              </div>

              {/* Current steps */}
              <div className="space-y-1.5 mt-1">
                {steps.map((st, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-[#eeedef] text-xs font-medium text-[#1a1c1d]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-md bg-[#e0bbe4]/30 text-[#66496b] font-bold flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <span className="truncate">{st}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="text-[#cfc3cc] hover:text-[#ba1a1a] transition-colors p-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add step row */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newStepInput}
                  onChange={(e) => setNewStepInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStep();
                    }
                  }}
                  placeholder="Add another sub-step..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#eeedef] text-xs font-medium text-[#1a1c1d] focus:outline-none focus:ring-2 focus:ring-[#e0bbe4] placeholder:text-[#4c444c]/40"
                />
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-3.5 py-2 bg-[#eeedef] hover:bg-[#e0bbe4]/40 text-[#4c444c] hover:text-[#725477] font-bold text-xs rounded-xl transition-all"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-2">
              <button
                id="btn-submit-quest"
                type="submit"
                disabled={isSubmitting}
                style={
                  submitSuccess
                    ? {}
                    : isSubmitting
                    ? { backgroundColor: 'var(--theme-primary)', opacity: 0.8 }
                    : { backgroundColor: 'var(--theme-primary)' }
                }
                className={`flex items-center gap-2 px-10 py-3.5 rounded-full transition-all duration-200 shadow-md font-bold text-sm tracking-wide active:scale-95 text-white ${
                  submitSuccess
                    ? 'bg-[#9ad5a2] text-[#265e35]'
                    : isSubmitting
                    ? 'cursor-wait'
                    : 'hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {submitSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check</span>
                    <span>Quest Hatched!</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">
                      progress_activity
                    </span>
                    <span>Hatching Quest...</span>
                  </>
                ) : (
                  <>
                    <span>Hatch Quest</span>
                    <span className="material-symbols-outlined text-[18px]">add_task</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};
