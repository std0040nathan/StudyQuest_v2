import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserAccount, UserStats } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (account: UserAccount) => void;
  existingAccounts: UserAccount[];
}

const AVATAR_OPTIONS = [
  { icon: 'school', label: 'Scholar', bg: 'bg-[#e0bbe4] text-[#725477]' },
  { icon: 'rocket_launch', label: 'Explorer', bg: 'bg-[#d5e3ff] text-[#2b4770]' },
  { icon: 'psychology', label: 'Thinker', bg: 'bg-[#FFF5BA] text-[#854d0e]' },
  { icon: 'smart_toy', label: 'Techie', bg: 'bg-[#b5f1bc] text-[#18512a]' },
  { icon: 'science', label: 'Scientist', bg: 'bg-[#fcd7ff] text-[#725477]' },
  { icon: 'brush', label: 'Artist', bg: 'bg-[#ffd8d8] text-[#8c2a2a]' },
  { icon: 'sports_esports', label: 'Gamer', bg: 'bg-[#d5e3ff] text-[#1e40af]' },
  { icon: 'menu_book', label: 'Reader', bg: 'bg-[#e9d5ff] text-[#6b21a8]' },
];

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  existingAccounts,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('Bina Bangsa School');
  const [grade, setGrade] = useState('Grade 10');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Quick One-Click Demo Student Login
  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      // Find existing demo or create Nathan's profile
      const demoAccount: UserAccount = existingAccounts.find(
        (acc) => acc.email.toLowerCase() === 'std0040.nathan@binabangsaschool.com'
      ) || {
        id: 'user-demo-nathan',
        name: 'Nathan',
        email: 'std0040.nathan@binabangsaschool.com',
        school: 'Bina Bangsa School',
        grade: 'Secondary 4 / Grade 10',
        avatarIcon: 'school',
        avatarColor: 'bg-[#e0bbe4] text-[#725477]',
        stats: {
          name: 'Nathan',
          title: 'Novice Scholar',
          level: 1,
          xp: 0,
          xpToNextLevel: 500,
          streak: 1,
          completedQuestsCount: 0,
        },
        quests: [],
        createdAt: new Date().toISOString(),
      };

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#725477', '#e0bbe4', '#b1cdfd', '#FFF5BA', '#9ad5a2'],
      });

      setIsLoading(false);
      onLoginSuccess(demoAccount);
    }, 400);
  };

  // Handle Sign In submission
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your student email or username.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching existing account
      const matched = existingAccounts.find(
        (acc) =>
          acc.email.toLowerCase() === loginEmail.trim().toLowerCase() ||
          acc.name.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      if (matched) {
        setIsLoading(false);
        onLoginSuccess(matched);
      } else {
        // Auto-create/sign in student profile if first time
        const cleanName = loginEmail.includes('@')
          ? loginEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Student'
          : loginEmail.trim();

        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        const newStudentAccount: UserAccount = {
          id: `user-${Date.now()}`,
          name: formattedName,
          email: loginEmail.trim(),
          school: 'Bina Bangsa School',
          grade: 'Grade 10',
          avatarIcon: 'school',
          avatarColor: 'bg-[#e0bbe4] text-[#725477]',
          stats: {
            name: formattedName,
            title: 'Novice Scholar',
            level: 1,
            xp: 0,
            xpToNextLevel: 500,
            streak: 1,
            completedQuestsCount: 0,
          },
          quests: [],
          createdAt: new Date().toISOString(),
        };

        setIsLoading(false);
        onLoginSuccess(newStudentAccount);
      }
    }, 400);
  };

  // Handle Sign Up registration
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your student name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your school email.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const initialStats: UserStats = {
        name: name.trim(),
        title: 'Novice Scholar',
        level: 1,
        xp: 0,
        xpToNextLevel: 500,
        streak: 1,
        completedQuestsCount: 0,
      };

      const newAccount: UserAccount = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        school: school.trim() || 'Bina Bangsa School',
        grade: grade.trim() || 'Grade 10',
        avatarIcon: selectedAvatar.icon,
        avatarColor: selectedAvatar.bg,
        stats: initialStats,
        quests: [],
        createdAt: new Date().toISOString(),
      };

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#725477', '#e0bbe4', '#b1cdfd', '#FFF5BA', '#9ad5a2'],
      });

      setIsLoading(false);
      onLoginSuccess(newAccount);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#faf9fb] relative overflow-hidden">
      {/* Background Pastel Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#ffffff]">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#d5e3ff]/35 rounded-full mix-blend-multiply filter blur-[120px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[450px] bg-[#FFF5BA]/45 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-15%] left-[20%] w-[650px] h-[500px] bg-[#e0bbe4]/35 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_15px_40px_rgba(114,84,119,0.12)] border border-[#e0bbe4]/30 overflow-hidden relative z-10 animate-fadeIn">
        {/* Top Branding Banner */}
        <div className="p-8 pb-6 bg-gradient-to-b from-[#e0bbe4]/25 to-transparent text-center border-b border-[#eeedef]/60">
          <div className="w-16 h-16 rounded-2xl bg-[#725477] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#725477]/25">
            <span className="material-symbols-outlined text-[34px]">auto_awesome</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#1a1c1d] tracking-tight font-['Quicksand']">
            StudyQuest
          </h1>
          <p className="text-xs sm:text-sm text-[#4c444c] font-medium mt-1">
            Student Quest & Homework Tracker
          </p>

          {/* Tab Switcher */}
          <div className="mt-6 p-1 bg-[#eeedef]/80 rounded-xl flex items-center gap-1 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#725477] shadow-xs'
                  : 'text-[#4c444c] hover:text-[#1a1c1d]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#725477] shadow-xs'
                  : 'text-[#4c444c] hover:text-[#1a1c1d]'
              }`}
            >
              New Student
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 pt-6">
          {/* Quick Demo One-Click Login Button */}
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            className="w-full mb-5 py-3 px-4 rounded-2xl border-2 border-[#e0bbe4] bg-[#e0bbe4]/20 hover:bg-[#e0bbe4]/35 text-[#725477] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px] text-yellow-600">
              bolt
            </span>
            <span>Instant Student Demo Login (Nathan)</span>
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-[#eeedef]"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-[#4c444c]/60">
              Or sign in with credentials
            </span>
            <div className="flex-grow border-t border-[#eeedef]"></div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                  School Email or Student ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                    mail
                  </span>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="std0040.nathan@binabangsaschool.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-sm text-[#1a1c1d] font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1a1c1d]">
                    Password or PIN
                  </label>
                  <span className="text-[11px] text-[#725477] font-semibold">
                    (Optional for demo)
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-sm text-[#1a1c1d] font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c444c]/70 hover:text-[#1a1c1d]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#4c444c] font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#725477] accent-[#725477]"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#725477] text-white font-bold text-sm hover:bg-[#593d5f] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#725477]/20"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    <span>Sign In to StudyQuest</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                  Student Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nathan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-sm text-[#1a1c1d] font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Bina Bangsa School"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] text-xs text-[#1a1c1d] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                    Grade / Level
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Secondary 4 / Grade 10"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] text-xs text-[#1a1c1d] font-medium"
                  />
                </div>
              </div>

              {/* Quick Grade chips */}
              <div className="flex flex-wrap gap-1.5">
                {['Sec 1 (Gr 7)', 'Sec 2 (Gr 8)', 'Sec 3 (Gr 9)', 'Sec 4 (Gr 10)', 'Grade 11', 'Grade 12', 'JC 1', 'JC 2'].map((gPreset) => (
                  <button
                    key={gPreset}
                    type="button"
                    onClick={() => setGrade(gPreset)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      grade === gPreset
                        ? 'bg-[#725477] text-white'
                        : 'bg-[#faf9fb] border border-[#eeedef] text-[#4c444c] hover:bg-[#e0bbe4]/25'
                    }`}
                  >
                    {gPreset}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                  School Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                    school
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@binabangsaschool.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-sm text-[#1a1c1d] font-medium"
                  />
                </div>
              </div>

              {/* Scholar Avatar Picker */}
              <div>
                <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                  Choose Your Scholar Avatar
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.icon}
                      type="button"
                      onClick={() => setSelectedAvatar(opt)}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                        selectedAvatar.icon === opt.icon
                          ? 'border-[#725477] bg-[#e0bbe4]/30 ring-2 ring-[#725477]'
                          : 'border-[#eeedef] bg-[#faf9fb] hover:bg-[#e0bbe4]/15'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${opt.bg} flex items-center justify-center`}>
                        <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#4c444c] truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-[#725477] text-white font-bold text-sm hover:bg-[#593d5f] active:scale-98 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#725477]/20"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                    <span>Create Scholar Profile</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Existing profiles list if any */}
          {existingAccounts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#eeedef]">
              <p className="text-[11px] font-bold text-[#4c444c] mb-2 uppercase tracking-wider">
                Existing Student Profiles on this Device
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {existingAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => onLoginSuccess(acc)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#e0bbe4]/20 border border-[#eeedef] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full ${
                          acc.avatarColor || 'bg-[#e0bbe4] text-[#725477]'
                        } flex items-center justify-center`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {acc.avatarIcon || 'person'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1a1c1d] group-hover:text-[#725477]">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-[#4c444c]">{acc.school || acc.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#725477] bg-[#e0bbe4]/30 px-2 py-0.5 rounded-full">
                      Level {acc.stats?.level || 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
