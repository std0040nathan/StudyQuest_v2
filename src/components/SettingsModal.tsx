import React, { useState, useEffect } from 'react';
import { UserAccount, AppSettings, Quest } from '../types';
import confetti from 'canvas-confetti';
import { INITIAL_QUESTS } from '../data/initialQuests';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: UserAccount;
  settings: AppSettings;
  quests: Quest[];
  onUpdateAccount: (updatedAccount: Partial<UserAccount>) => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onImportQuests: (importedQuests: Quest[]) => void;
  onResetQuests: () => void;
}

const GRADE_PRESETS = [
  { label: 'Grade 5', value: 'Grade 5 / Primary 5', group: 'Primary / Elementary' },
  { label: 'Grade 6', value: 'Grade 6 / Primary 6', group: 'Primary / Middle' },
  { label: 'Grade 7', value: 'Grade 7 / Middle School', group: 'Middle School' },
  { label: 'Grade 8', value: 'Grade 8 / Middle School', group: 'Middle School' },
  { label: 'Grade 9', value: 'Grade 9 / High School', group: 'High School' },
  { label: 'Grade 10', value: 'Grade 10 / High School', group: 'High School' },
  { label: 'Grade 11', value: 'Grade 11 / High School', group: 'Senior High' },
  { label: 'Grade 12', value: 'Grade 12 / Senior', group: 'Senior High' },
  { label: 'Primary 5', value: 'Primary 5 (P5)', group: 'Primary' },
  { label: 'Primary 6', value: 'Primary 6 (P6)', group: 'Primary' },
  { label: 'Sec 1-2', value: 'Secondary 1-2', group: 'Secondary' },
  { label: 'Sec 3-4', value: 'Secondary 3-4', group: 'Secondary' },
];

const AVATAR_ICONS = [
  { icon: 'school', label: 'Scholar' },
  { icon: 'rocket_launch', label: 'Explorer' },
  { icon: 'psychology', label: 'Thinker' },
  { icon: 'smart_toy', label: 'Techie' },
  { icon: 'science', label: 'Scientist' },
  { icon: 'brush', label: 'Artist' },
  { icon: 'sports_esports', label: 'Gamer' },
  { icon: 'menu_book', label: 'Reader' },
  { icon: 'workspace_premium', label: 'Achiever' },
  { icon: 'calculate', label: 'Mathematician' },
  { icon: 'code', label: 'Coder' },
  { icon: 'stars', label: 'Astronaut' },
];

const AVATAR_COLORS = [
  { class: 'bg-[#e0bbe4] text-[#725477]', label: 'Lilac' },
  { class: 'bg-[#d5e3ff] text-[#2b4770]', label: 'Sky' },
  { class: 'bg-[#FFF5BA] text-[#854d0e]', label: 'Butter' },
  { class: 'bg-[#b5f1bc] text-[#18512a]', label: 'Mint' },
  { class: 'bg-[#fcd7ff] text-[#725477]', label: 'Pink' },
  { class: 'bg-[#ffd8d8] text-[#8c2a2a]', label: 'Coral' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  settings,
  quests,
  onUpdateAccount,
  onUpdateSettings,
  onImportQuests,
  onResetQuests,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'performance' | 'workflow' | 'data'>('profile');

  // Form states for Profile
  const [name, setName] = useState(currentAccount.name || '');
  const [email, setEmail] = useState(currentAccount.email || 'scholar@studyquest.edu');
  const [age, setAge] = useState<number | ''>(currentAccount.age || 11);
  const [grade, setGrade] = useState(currentAccount.grade || 'Grade 5');
  const [school, setSchool] = useState(currentAccount.school || 'Bina Bangsa School');
  const [avatarIcon, setAvatarIcon] = useState(currentAccount.avatarIcon || 'school');
  const [avatarColor, setAvatarColor] = useState(currentAccount.avatarColor || 'bg-[#e0bbe4] text-[#725477]');

  // Form states for Password & Security
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Form states for Performance & Preferences
  const [lowPowerMode, setLowPowerMode] = useState(settings.lowPowerMode);
  const [enableAnimations, setEnableAnimations] = useState(settings.enableAnimations);
  const [enableConfetti, setEnableConfetti] = useState(settings.enableConfetti);
  const [enableSoundEffects, setEnableSoundEffects] = useState(settings.enableSoundEffects);
  const [compactMode, setCompactMode] = useState(settings.compactMode);

  // Form states for Workflow
  const [autoCompleteOnAllSteps, setAutoCompleteOnAllSteps] = useState(settings.autoCompleteOnAllSteps);
  const [defaultAlarmLeadMinutes, setDefaultAlarmLeadMinutes] = useState(settings.defaultAlarmLeadMinutes);
  const [dailyStudyGoalHours, setDailyStudyGoalHours] = useState(settings.dailyStudyGoalHours || 3);

  // Status feedback
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Sync state when currentAccount/settings update
  useEffect(() => {
    if (isOpen) {
      setName(currentAccount.name || '');
      setEmail(currentAccount.email || 'scholar@studyquest.edu');
      setAge(currentAccount.age !== undefined ? currentAccount.age : 11);
      setGrade(currentAccount.grade || 'Grade 5');
      setSchool(currentAccount.school || 'Bina Bangsa School');
      setAvatarIcon(currentAccount.avatarIcon || 'school');
      setAvatarColor(currentAccount.avatarColor || 'bg-[#e0bbe4] text-[#725477]');

      setCurrentPasswordInput('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSecurityError('');
      setSecuritySuccess('');

      setLowPowerMode(settings.lowPowerMode);
      setEnableAnimations(settings.enableAnimations);
      setEnableConfetti(settings.enableConfetti);
      setEnableSoundEffects(settings.enableSoundEffects);
      setCompactMode(settings.compactMode);

      setAutoCompleteOnAllSteps(settings.autoCompleteOnAllSteps);
      setDefaultAlarmLeadMinutes(settings.defaultAlarmLeadMinutes);
      setDailyStudyGoalHours(settings.dailyStudyGoalHours || 3);
      setSavedSuccess(false);
      setImportStatus(null);
    }
  }, [isOpen, currentAccount, settings]);

  if (!isOpen) return null;

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    // If account already has a password, verify current password
    if (currentAccount.password && currentAccount.password !== currentPasswordInput.trim()) {
      setSecurityError('Current password does not match. Please verify your existing password.');
      return;
    }

    if (!newPassword.trim()) {
      setSecurityError('Please enter a new password or PIN.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setSecurityError('Password must be at least 4 characters or digits long.');
      return;
    }

    if (newPassword.trim() !== confirmNewPassword.trim()) {
      setSecurityError('New password and confirm password do not match.');
      return;
    }

    // Update account with new password
    onUpdateAccount({
      password: newPassword.trim(),
    });

    setSecuritySuccess('Password successfully updated & synced across all your devices!');
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmNewPassword('');

    if (enableConfetti) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#725477', '#b5f1bc', '#b1cdfd'],
      });
    }

    setTimeout(() => {
      setSecuritySuccess('');
    }, 4000);
  };

  const handleRemovePassword = () => {
    if (currentAccount.password && currentAccount.password !== currentPasswordInput.trim()) {
      setSecurityError('Please enter your current password above first to remove password protection.');
      return;
    }

    onUpdateAccount({
      password: undefined,
    });
    setSecuritySuccess('Password protection removed. Any device can now sign in without a password.');
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => {
      setSecuritySuccess('');
    }, 4000);
  };

  const handleSaveAll = () => {
    // Save Profile
    const finalAge = age === '' ? undefined : Number(age);
    onUpdateAccount({
      name: name.trim() || currentAccount.name,
      email: email.trim() || currentAccount.email,
      age: finalAge,
      grade: grade.trim(),
      school: school.trim(),
      avatarIcon,
      avatarColor,
    });

    // Save Settings
    onUpdateSettings({
      age: finalAge,
      grade: grade.trim(),
      school: school.trim(),
      dailyStudyGoalHours,
      lowPowerMode,
      enableAnimations,
      enableConfetti,
      enableSoundEffects,
      compactMode,
      autoCompleteOnAllSteps,
      defaultAlarmLeadMinutes,
    });

    setSavedSuccess(true);

    if (enableConfetti) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#725477', '#e0bbe4', '#b1cdfd', '#9ad5a2'],
      });
    }

    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  // Export JSON
  const handleExportData = () => {
    const dataToExport = {
      user: {
        ...currentAccount,
        age: age === '' ? undefined : Number(age),
        grade,
        school,
      },
      settings: {
        lowPowerMode,
        enableAnimations,
        enableConfetti,
        enableSoundEffects,
        compactMode,
        autoCompleteOnAllSteps,
        defaultAlarmLeadMinutes,
      },
      quests,
      exportedAt: new Date().toISOString(),
      version: '5.0',
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyQuest-${name.replace(/\s+/g, '_') || 'Student'}-Data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.quests && Array.isArray(parsed.quests)) {
          onImportQuests(parsed.quests);
          if (parsed.user) {
            onUpdateAccount(parsed.user);
          }
          if (parsed.settings) {
            onUpdateSettings(parsed.settings);
          }
          setImportStatus(`Successfully imported ${parsed.quests.length} quests!`);
        } else {
          setImportStatus('Invalid JSON format: missing quests array.');
        }
      } catch (err) {
        console.error('Import error', err);
        setImportStatus('Failed to parse file. Please upload a valid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="settings-modal"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#e0bbe4]/30 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-[#e0bbe4]/35 via-[#faf9fb] to-[#d5e3ff]/35 border-b border-[#eeedef] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#725477] text-white flex items-center justify-center shadow-md shadow-[#725477]/20">
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a1c1d] tracking-tight font-['Quicksand']">
                StudyQuest Settings
              </h2>
              <p className="text-xs text-[#4c444c] font-medium">
                Student Profile, Academic Grade & Performance Controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#4c444c] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#eeedef] px-6 bg-[#faf9fb]/60 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={activeTab === 'profile' ? { borderBottomColor: 'var(--theme-primary)', color: 'var(--theme-primary)' } : {}}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? ''
                : 'border-transparent text-[#4c444c] hover:text-[#1a1c1d]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span>Student & Grade</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={activeTab === 'security' ? { borderBottomColor: 'var(--theme-primary)', color: 'var(--theme-primary)' } : {}}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? ''
                : 'border-transparent text-[#4c444c] hover:text-[#1a1c1d]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            <span>Password & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('performance')}
            style={activeTab === 'performance' ? { borderBottomColor: 'var(--theme-primary)', color: 'var(--theme-primary)' } : {}}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'performance'
                ? ''
                : 'border-transparent text-[#4c444c] hover:text-[#1a1c1d]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">speed</span>
            <span>Performance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            style={activeTab === 'workflow' ? { borderBottomColor: 'var(--theme-primary)', color: 'var(--theme-primary)' } : {}}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'workflow'
                ? ''
                : 'border-transparent text-[#4c444c] hover:text-[#1a1c1d]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Quest Workflow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            style={activeTab === 'data' ? { borderBottomColor: 'var(--theme-primary)', color: 'var(--theme-primary)' } : {}}
            className={`py-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'data'
                ? ''
                : 'border-transparent text-[#4c444c] hover:text-[#1a1c1d]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">database</span>
            <span>Backup & Data</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {savedSuccess && (
            <div className="p-3 bg-[#b5f1bc]/40 border border-[#b5f1bc] text-[#18512a] rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Settings updated and saved successfully!</span>
            </div>
          )}

          {/* TAB 1: Student Profile & Grade */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Profile Preview Card */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl ${avatarColor} flex items-center justify-center shadow-md shrink-0`}
                >
                  <span className="material-symbols-outlined text-[28px]">{avatarIcon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1a1c1d] text-base">{name || 'Student Name'}</h4>
                  <p className="text-xs text-[#725477] font-semibold">
                    {grade || 'Grade Unset'} • {school || 'Bina Bangsa School'}
                    {age ? ` • ${age} yrs old` : ''}
                  </p>
                  <p className="text-[11px] text-[#4c444c] mt-0.5">{email || 'scholar@studyquest.edu'}</p>
                </div>
              </div>

              {/* Student Name & Email & School Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                    Student Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. nobody"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                    Student / School Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scholar@studyquest.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                    School / Institution
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Bina Bangsa School"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* GRADE LEVEL SELECTION (Prominent & Featured) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#e0bbe4]/20 via-[#faf9fb] to-[#d5e3ff]/20 border border-[#e0bbe4]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#725477]">
                      school
                    </span>
                    <label className="text-xs font-bold text-[#1a1c1d]">
                      Academic Grade / Year Level
                    </label>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#725477] text-white">
                    {grade || 'Not Selected'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Grade 5 / Primary 5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm font-semibold text-[#1a1c1d]"
                  />
                </div>

                {/* Quick Grade Preset Selector Chips */}
                <div>
                  <p className="text-[11px] font-semibold text-[#4c444c] mb-2">
                    Quick Grade Presets:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {GRADE_PRESETS.map((preset) => {
                      const isSelected = grade.toLowerCase().includes(preset.label.toLowerCase()) || grade === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => setGrade(preset.value)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#725477] text-white shadow-sm ring-2 ring-[#725477]/30 scale-[1.02]'
                              : 'bg-white border border-[#eeedef] text-[#4c444c] hover:bg-[#e0bbe4]/25 hover:text-[#725477]'
                          }`}
                          title={`${preset.group}: ${preset.value}`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Optional Age helper if needed */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9fb] border border-[#eeedef]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#4c444c]">
                    cake
                  </span>
                  <span className="text-xs font-bold text-[#4c444c]">Age (Optional)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="99"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="16"
                    className="w-16 px-2.5 py-1 rounded-lg bg-white border border-[#eeedef] text-center text-xs font-bold text-[#1a1c1d]"
                  />
                  <span className="text-xs text-[#4c444c] font-medium">years old</span>
                </div>
              </div>

              {/* Avatar Icon Picker */}
              <div>
                <label className="block text-xs font-bold text-[#1a1c1d] mb-2">
                  Scholar Avatar Icon
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_ICONS.map((item) => (
                    <button
                      key={item.icon}
                      type="button"
                      onClick={() => setAvatarIcon(item.icon)}
                      className={`p-2.5 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                        avatarIcon === item.icon
                          ? 'border-[#725477] bg-[#e0bbe4]/30 ring-2 ring-[#725477]'
                          : 'border-[#eeedef] bg-[#faf9fb] hover:bg-[#e0bbe4]/15'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px] text-[#725477]">
                        {item.icon}
                      </span>
                      <span className="text-[10px] font-bold text-[#4c444c] truncate">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Color Theme */}
              <div>
                <label className="block text-xs font-bold text-[#1a1c1d] mb-2">
                  Avatar Color Theme
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      key={col.label}
                      type="button"
                      onClick={() => setAvatarColor(col.class)}
                      style={
                        avatarColor === col.class
                          ? { borderColor: 'var(--theme-primary)', boxShadow: '0 0 0 2px var(--theme-primary)' }
                          : {}
                      }
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                        avatarColor === col.class
                          ? 'shadow-xs'
                          : 'border-[#eeedef] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full ${col.class}`} />
                      <span>{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Password & Security Quick Banner */}
              <div className="p-4 rounded-2xl bg-[#f4eff4] border border-[#eeedef] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e0bbe4] text-[#725477] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">lock</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                      Account Password & Multi-Device Security
                    </h4>
                    <p className="text-[11px] text-[#4c444c] mt-0.5">
                      {currentAccount.password
                        ? '🔒 Password protected (Compulsory on iPad, phone & web)'
                        : '⚠️ No password set yet. Click below to set a secure password.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="px-3.5 py-2 rounded-xl bg-[#725477] text-white text-xs font-bold hover:bg-[#593d5f] transition-all shrink-0"
                >
                  {currentAccount.password ? 'Change Password' : 'Set Password'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Password & Security */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Security Status Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#e0bbe4]/25 via-white to-[#d5e3ff]/25 border border-[#e0bbe4]/40 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#725477] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">shield_lock</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#1a1c1d]">
                      Compulsory Account Protection
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentAccount.password
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {currentAccount.password ? 'Protected' : 'Password Required'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4c444c] mt-1 leading-relaxed">
                    Setting a password makes it <strong>compulsory</strong> whenever anyone logs into <strong>{currentAccount.name}</strong> from any device (phone, iPad, Chromebook, or browser). This protects your quests, EXP, and school tasks.
                  </p>
                </div>
              </div>

              {securityError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{securityError}</span>
                </div>
              )}

              {securitySuccess && (
                <div className="p-3 bg-[#b5f1bc]/40 border border-[#b5f1bc] text-[#18512a] rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{securitySuccess}</span>
                </div>
              )}

              {/* Password Change / Setup Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {currentAccount.password && (
                  <div>
                    <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                        lock_clock
                      </span>
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c444c]/70 hover:text-[#1a1c1d]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showCurrentPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                      New Password or PIN <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                        key
                      </span>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 4 characters or PIN"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c444c]/70 hover:text-[#1a1c1d]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showNewPass ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                        verified_user
                      </span>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#725477] text-white text-xs sm:text-sm font-bold hover:bg-[#593d5f] active:scale-98 transition-all flex items-center gap-2 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                    <span>{currentAccount.password ? 'Update Password' : 'Save & Make Password Compulsory'}</span>
                  </button>

                  {currentAccount.password && (
                    <button
                      type="button"
                      onClick={handleRemovePassword}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all"
                    >
                      Remove Password Protection
                    </button>
                  )}
                </div>
              </form>

              {/* Cloud Sync Information */}
              <div className="p-3.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] text-xs text-[#4c444c] flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-green-600">cloud_sync</span>
                <span>
                  Your password is automatically encrypted and synced in real time with Cloud Firestore across all devices.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Performance & Graphics Settings */}
          {activeTab === 'performance' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-[#d5e3ff]/30 border border-[#b1cdfd] text-[#001c3b] text-xs leading-relaxed flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-[#2b4770] shrink-0 mt-0.5">
                  info
                </span>
                <p>
                  Optimize rendering performance and battery life for school Chromebooks, laptops, or low-power hardware.
                </p>
              </div>

              {/* Setting 1: Low Power / Chromebook Mode */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF5BA] text-[#854d0e] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">battery_saver</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                      Low Power / Eco Mode
                    </h4>
                    <p className="text-xs text-[#4c444c] mt-0.5">
                      Disables heavy glassmorphism blurs and background animations for maximum battery life.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={lowPowerMode}
                    onChange={(e) => setLowPowerMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#eeedef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#eeedef] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#725477]" />
                </label>
              </div>

              {/* Setting 2: Enable UI Animations */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e0bbe4]/50 text-[#725477] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">animation</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                      Smooth UI Animations & Transitions
                    </h4>
                    <p className="text-xs text-[#4c444c] mt-0.5">
                      Enables fluid interactive layout transitions and fade-ins.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableAnimations}
                    onChange={(e) => setEnableAnimations(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#eeedef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#eeedef] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#725477]" />
                </label>
              </div>

              {/* Setting 3: Confetti celebration bursts */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fcd7ff] text-[#725477] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">celebration</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                      Celebration Confetti Effects
                    </h4>
                    <p className="text-xs text-[#4c444c] mt-0.5">
                      Show colorful particle fireworks when completing quests and levelling up.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableConfetti}
                    onChange={(e) => setEnableConfetti(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#eeedef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#eeedef] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#725477]" />
                </label>
              </div>

              {/* Setting 4: Audio Sound Effects */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#b5f1bc] text-[#18512a] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">volume_up</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                      Sound Effects & Harmonic Chimes
                    </h4>
                    <p className="text-xs text-[#4c444c] mt-0.5">
                      Play relaxing Web Audio chimes for step checks, alarms, and rank promotions.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={enableSoundEffects}
                    onChange={(e) => setEnableSoundEffects(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#eeedef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#eeedef] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#725477]" />
                </label>
              </div>

              {/* Setting 5: Compact Density Mode */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e0bbe4]/30 text-[#725477] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">density_medium</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                      Compact View Mode
                    </h4>
                    <p className="text-xs text-[#4c444c] mt-0.5">
                      Reduces card padding to fit more quests on smaller screens and tablets.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#eeedef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#eeedef] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#725477]" />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Quest Workflow */}
          {activeTab === 'workflow' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Daily Study Goal */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                    Daily Study Target (Hours)
                  </label>
                  <span className="text-xs font-bold text-[#725477] bg-[#e0bbe4]/30 px-2.5 py-0.5 rounded-full">
                    {dailyStudyGoalHours} hours / day
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={dailyStudyGoalHours}
                  onChange={(e) => setDailyStudyGoalHours(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#eeedef] rounded-lg appearance-none cursor-pointer accent-[#725477]"
                />
                <div className="flex justify-between text-[10px] text-[#4c444c] mt-1 font-semibold">
                  <span>1 hr (Light)</span>
                  <span>3 hrs (Standard)</span>
                  <span>6+ hrs (Exam Mode)</span>
                </div>
              </div>

              {/* Auto Complete Option */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#b5f1bc] text-[#18512a] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                      Auto-Complete Quest When All Steps Checked
                    </h4>
                    <p className="text-xs text-[#4c444c] mt-0.5">
                      Automatically claims bonus EXP and clears quest from agenda once final step is checked.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={autoCompleteOnAllSteps}
                    onChange={(e) => setAutoCompleteOnAllSteps(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#eeedef] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#eeedef] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#725477]" />
                </label>
              </div>

              {/* Default Alarm Advance Lead Time */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef]">
                <label className="block text-xs sm:text-sm font-bold text-[#1a1c1d] mb-1.5">
                  Default Quest Alarm Lead Time
                </label>
                <p className="text-xs text-[#4c444c] mb-3">
                  Pre-fills alarm time before the scheduled deadline when hatching new quests.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { mins: 0, label: 'At Deadline' },
                    { mins: 15, label: '15 mins before' },
                    { mins: 30, label: '30 mins before' },
                    { mins: 60, label: '1 hour before' },
                  ].map((lead) => (
                    <button
                      key={lead.mins}
                      type="button"
                      onClick={() => setDefaultAlarmLeadMinutes(lead.mins)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                        defaultAlarmLeadMinutes === lead.mins
                          ? 'border-[#725477] bg-[#725477] text-white shadow-xs'
                          : 'border-[#eeedef] bg-white text-[#4c444c] hover:bg-[#e0bbe4]/20'
                      }`}
                    >
                      {lead.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Data Management & Backup */}
          {activeTab === 'data' && (
            <div className="space-y-4 animate-fadeIn">
              {importStatus && (
                <div className="p-3 bg-[#e0bbe4]/30 border border-[#e0bbe4] text-[#725477] rounded-xl text-xs font-bold">
                  {importStatus}
                </div>
              )}

              {/* Export JSON */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                    Export Student Data & Quests
                  </h4>
                  <p className="text-xs text-[#4c444c] mt-0.5">
                    Download a secure JSON backup of your current quests, level progress, and preferences.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2.5 bg-[#725477] hover:bg-[#593d5f] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Import JSON */}
              <div className="p-4 rounded-2xl bg-[#faf9fb] border border-[#eeedef] flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1a1c1d]">
                    Import Backup File
                  </h4>
                  <p className="text-xs text-[#4c444c] mt-0.5">
                    Restore quests and settings from an exported JSON file.
                  </p>
                </div>
                <label className="px-4 py-2.5 bg-white border border-[#725477] text-[#725477] hover:bg-[#e0bbe4]/20 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-all shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  <span>Import File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset to Default Quest Presets */}
              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-red-900">
                    Restore Sample Quests
                  </h4>
                  <p className="text-xs text-red-700/80 mt-0.5">
                    Repopulates sample school homework (Math, Science, English, Chinese) if board is empty.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Restore quest board with sample school quests?')) {
                      onResetQuests();
                      setImportStatus('Reset completed with initial quest presets.');
                    }
                  }}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  <span>Restore Quests</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-[#eeedef] bg-[#faf9fb] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#4c444c] hover:bg-black/5 rounded-xl transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              style={{
                backgroundColor: 'var(--theme-primary)',
              }}
              className="px-5 py-2.5 hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-98"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
