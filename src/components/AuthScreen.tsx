import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserAccount, UserStats } from '../types';
import {
  findCloudAccountByEmailOrName,
  saveAccountToCloud,
  fetchAllCloudAccounts,
} from '../utils/firebase';

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
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');

  // Sign In form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('Bina Bangsa School');
  const [grade, setGrade] = useState('Primary 3');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);

  // Combined accounts (local + cloud fetched)
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>(existingAccounts);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch all accounts from Cloud Firestore on mount so all devices see all created accounts
  useEffect(() => {
    let isMounted = true;
    const loadCloudAccounts = async () => {
      setIsSyncingCloud(true);
      try {
        const cloudAccs = await fetchAllCloudAccounts();
        if (isMounted && cloudAccs.length > 0) {
          // Merge local & cloud accounts, preferring cloud version by ID or email
          const map = new Map<string, UserAccount>();
          existingAccounts.forEach((acc) => {
            if (acc.id) map.set(acc.id, acc);
            if (acc.email) map.set(acc.email.toLowerCase(), acc);
          });
          cloudAccs.forEach((acc) => {
            if (acc.id) map.set(acc.id, acc);
            if (acc.email) map.set(acc.email.toLowerCase(), acc);
          });

          // Unique array of accounts
          const uniqueList: UserAccount[] = [];
          const seenIds = new Set<string>();
          for (const acc of map.values()) {
            if (!seenIds.has(acc.id)) {
              seenIds.add(acc.id);
              uniqueList.push(acc);
            }
          }
          setAllAccounts(uniqueList);
        }
      } catch (err) {
        console.debug('Initial cloud accounts fetch info:', err);
      } finally {
        if (isMounted) setIsSyncingCloud(false);
      }
    };

    loadCloudAccounts();
    return () => {
      isMounted = false;
    };
  }, [existingAccounts]);

  // Handle Sign In submission with Cloud Firestore Multi-Device Verification
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const inputVal = loginEmail.trim();
    if (!inputVal) {
      setErrorMsg('Please enter your student email or username.');
      return;
    }

    if (!loginPassword.trim()) {
      setErrorMsg('Password / PIN is compulsory. Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check Cloud Firestore first for multi-device lookup
      let targetAccount = await findCloudAccountByEmailOrName(inputVal);

      // 2. If not found in Cloud, check locally cached accounts
      if (!targetAccount) {
        targetAccount = allAccounts.find(
          (acc) =>
            acc.email.toLowerCase() === inputVal.toLowerCase() ||
            acc.name.toLowerCase() === inputVal.toLowerCase()
        ) || null;
      }

      if (targetAccount) {
        // If password is set on the account, verify it strictly
        if (targetAccount.password) {
          if (targetAccount.password !== loginPassword.trim()) {
            setErrorMsg('Incorrect password or PIN for this student account.');
            setIsLoading(false);
            return;
          }
        } else {
          // If legacy account didn't have password, set it to the provided password
          targetAccount.password = loginPassword.trim();
        }

        // Successfully logged in — sync to cloud to ensure latest session
        saveAccountToCloud(targetAccount).catch(() => {});
        setIsLoading(false);
        onLoginSuccess(targetAccount);
        return;
      }

      // 3. If account doesn't exist yet, create a fresh cloud-synced student profile with compulsory password
      if (loginPassword.trim().length < 4) {
        setErrorMsg('Password must be at least 4 characters or digits long.');
        setIsLoading(false);
        return;
      }

      const cleanName = inputVal.includes('@')
        ? inputVal.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Scholar'
        : inputVal.trim();

      const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      const newStudentAccount: UserAccount = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: formattedName,
        email: inputVal,
        password: loginPassword.trim(),
        school: 'Bina Bangsa School',
        grade: 'Primary 3',
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

      // Save to Cloud Firestore so it is instantly available across all other devices
      await saveAccountToCloud(newStudentAccount);

      setIsLoading(false);
      onLoginSuccess(newStudentAccount);
    } catch (err) {
      console.error('Sign in error:', err);
      setIsLoading(false);
      setErrorMsg('Error signing in. Please check your connection and try again.');
    }
  };

  // Handle Sign Up registration with Cloud Firestore persistence & Compulsory Password
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your student name.');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your school email or student ID.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Password is compulsory. Please create a password or PIN.');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg('Password must be at least 4 characters or digits.');
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setErrorMsg('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already registered in cloud
      const existingInCloud = await findCloudAccountByEmailOrName(email.trim());
      if (existingInCloud) {
        setErrorMsg('An account with this email/name already exists. Please Sign In.');
        setIsLoading(false);
        return;
      }

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
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        school: school.trim() || 'Bina Bangsa School',
        grade: grade.trim() || 'Primary 3',
        avatarIcon: selectedAvatar.icon,
        avatarColor: selectedAvatar.bg,
        stats: initialStats,
        quests: [],
        createdAt: new Date().toISOString(),
      };

      // Save into Cloud Firestore for all devices
      await saveAccountToCloud(newAccount);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#725477', '#e0bbe4', '#b1cdfd', '#FFF5BA', '#9ad5a2'],
      });

      setIsLoading(false);
      onLoginSuccess(newAccount);
    } catch (err) {
      console.error('Registration cloud error:', err);
      setIsLoading(false);
      setErrorMsg('Could not register account to cloud. Please try again.');
    }
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
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#725477] shadow-xs'
                  : 'text-[#4c444c] hover:text-[#1a1c1d]'
              }`}
            >
              Create Account
            </button>
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
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 pt-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#d5e3ff]/40 border border-[#b1cdfd] text-[#001c3b] text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>{infoMsg}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                  School Email or Student ID <span className="text-red-500">*</span>
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
                    placeholder="e.g. student@school.edu or username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-sm text-[#1a1c1d] font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1a1c1d]">
                    Password or PIN <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#725477] font-bold">
                    Compulsory
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password or PIN"
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
                <p className="text-[11px] text-[#4c444c]/70 mt-1">
                  Required to verify your student account across devices (phone, iPad, web).
                </p>
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
                    placeholder="e.g. Alex Chen"
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
                    placeholder="e.g. Primary 3, Primary 4, Primary 5, Primary 6"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] text-xs text-[#1a1c1d] font-medium"
                  />
                </div>
              </div>

              {/* Quick Grade chips */}
              <div className="flex flex-wrap gap-1.5">
                {['Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'].map((gPreset) => (
                  <button
                    key={gPreset}
                    type="button"
                    onClick={() => setGrade(gPreset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                    Account Password / PIN <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 4 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm text-[#1a1c1d] font-medium"
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

                <div>
                  <label className="block text-xs font-bold text-[#1a1c1d] mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4c444c]/70 text-[20px]">
                      verified_user
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] focus:border-[#725477] focus:ring-2 focus:ring-[#e0bbe4]/30 outline-none text-xs sm:text-sm text-[#1a1c1d] font-medium"
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#4c444c]/70">
                Password is compulsory to secure your account on iPad, phone, and laptop.
              </p>

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
                    <span>Create Cloud-Synced Profile</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Cloud Status Indicator */}
          <div className="mt-5 px-3 py-2 bg-[#f4eff4] rounded-xl flex items-center justify-between text-xs text-[#725477]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-green-600">cloud_done</span>
              <span className="font-semibold text-[11px]">Multi-Device Cloud Sync Enabled</span>
            </div>
            {isSyncingCloud && (
              <span className="text-[10px] text-[#4c444c] animate-pulse">Syncing...</span>
            )}
          </div>

          {/* Existing profiles list (merged local & cloud across all devices) */}
          {allAccounts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#eeedef]">
              <p className="text-[11px] font-bold text-[#4c444c] mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Available Scholar Profiles</span>
                <span className="text-[10px] lowercase font-normal text-[#725477]">
                  {allAccounts.length} cloud/device {allAccounts.length === 1 ? 'account' : 'accounts'}
                </span>
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {allAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setLoginEmail(acc.email || acc.name);
                      setMode('signin');
                      setErrorMsg('');
                      setInfoMsg(`Selected ${acc.name}. Please enter your password or PIN to sign in.`);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#e0bbe4]/20 border border-[#eeedef] cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full ${
                          acc.avatarColor || 'bg-[#e0bbe4] text-[#725477]'
                        } flex items-center justify-center shadow-xs`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {acc.avatarIcon || 'person'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-[#1a1c1d] group-hover:text-[#725477]">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-[#4c444c]">
                          {acc.grade || 'Primary 3'} • {acc.school || acc.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {acc.password && (
                        <span className="material-symbols-outlined text-[#4c444c]/60 text-[14px]" title="Protected by Password/PIN">
                          lock
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-[#725477] bg-[#e0bbe4]/30 px-2 py-0.5 rounded-full">
                        Level {acc.stats?.level || 1}
                      </span>
                    </div>
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
