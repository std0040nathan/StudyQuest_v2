import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CreateQuest } from './components/CreateQuest';
import { QuestDetailModal } from './components/QuestDetailModal';
import { CalendarModal } from './components/CalendarModal';
import { SearchModal } from './components/SearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { LevelUpModal } from './components/LevelUpModal';
import { AlarmNotificationModal } from './components/AlarmNotificationModal';
import { AuthScreen } from './components/AuthScreen';
import { XpToast, XpToastInfo } from './components/XpToast';
import { INITIAL_QUESTS, INITIAL_USER_STATS } from './data/initialQuests';
import { Quest, UserStats, UserAccount, AppSettings } from './types';
import { playTaskCompleteSound, setSoundEffectsEnabled } from './utils/audio';
import { applyThemeToDocument } from './utils/theme';
import {
  saveAccountToCloud,
  subscribeToCloudAccount,
  fetchAllCloudAccounts,
} from './utils/firebase';

const PRIMARY_STORAGE_KEY_ACCOUNTS = 'studyquest_master_accounts_v1';
const PRIMARY_STORAGE_KEY_ACTIVE_USER_ID = 'studyquest_master_active_user_id';
const PRIMARY_STORAGE_KEY_SETTINGS = 'studyquest_master_settings';

const FALLBACK_ACCOUNT_KEYS = [
  'studyquest_master_accounts_v1',
  'studyquest_accounts_v5',
  'studyquest_accounts_v4',
  'studyquest_accounts_v3',
  'studyquest_accounts_v2',
  'studyquest_accounts',
];

const FALLBACK_ACTIVE_KEYS = [
  'studyquest_master_active_user_id',
  'studyquest_active_user_id_v5',
  'studyquest_active_user_id_v4',
  'studyquest_active_user_id',
];

const DEFAULT_SETTINGS: AppSettings = {
  age: 11,
  grade: 'Grade 5',
  school: 'Bina Bangsa School',
  dailyStudyGoalHours: 2,
  lowPowerMode: false,
  enableAnimations: true,
  enableConfetti: true,
  enableSoundEffects: true,
  compactMode: false,
  autoCompleteOnAllSteps: true,
  defaultAlarmLeadMinutes: 15,
};

const LEVEL_TITLES = [
  'Novice Scholar',
  'Quest Scout',
  'Study Apprentice',
  'Focus Specialist',
  'Task Strategist',
  'Knowledge Seeker',
  'Dedicated Scholar',
  'Mind Tactician',
  'Deadline Slayer',
  'Champion of Tasks',
  'Master Scholar',
  'Explorer Mode',
  'Academic Champion',
  'High Archon',
  'Sage of Quests',
  'Grandmaster Mind',
  'Productivity Paragon',
  'Mythic Polymath',
  'Legend of Focus',
  'Supreme Luminary',
];

const getTitleForLevel = (level: number) => {
  const idx = Math.min(LEVEL_TITLES.length - 1, Math.max(0, level - 1));
  return LEVEL_TITLES[idx];
};

const DEFAULT_INITIAL_ACCOUNT: UserAccount = {
  id: 'user-bobby-jr-the-third',
  name: 'Bobby Jr. the third',
  email: 'bobby.jr3@studyquest.edu',
  age: 11,
  school: 'Bina Bangsa School',
  grade: 'Grade 5',
  avatarIcon: 'school',
  avatarColor: 'bg-[#e0bbe4] text-[#725477]',
  stats: INITIAL_USER_STATS,
  quests: INITIAL_QUESTS,
  createdAt: new Date().toISOString(),
};

// Helper to sanitize any accidental personal email in local storage
const sanitizeAccount = (account: UserAccount): UserAccount => {
  if (account.email && account.email.includes('std0040.nathan')) {
    return { ...account, email: 'scholar@studyquest.edu' };
  }
  return account;
};

// Helper to scan all historical storage keys so user NEVER loses quests across app updates
const loadAllPersistedAccounts = (): UserAccount[] => {
  const accountsMap = new Map<string, UserAccount>();

  // Insert default Bobby Jr account first
  accountsMap.set(DEFAULT_INITIAL_ACCOUNT.id, DEFAULT_INITIAL_ACCOUNT);

  for (const key of FALLBACK_ACCOUNT_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.id && item.name) {
              const sanitized = sanitizeAccount(item);
              const existing = accountsMap.get(sanitized.id);
              // Merge smartly: retain account with more quests or most recent
              if (!existing) {
                accountsMap.set(sanitized.id, sanitized);
              } else {
                const existingQuestsCount = existing.quests?.length || 0;
                const newQuestsCount = sanitized.quests?.length || 0;
                if (newQuestsCount >= existingQuestsCount) {
                  accountsMap.set(sanitized.id, {
                    ...existing,
                    ...sanitized,
                    quests: sanitized.quests && sanitized.quests.length > 0 ? sanitized.quests : existing.quests,
                  });
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error reading key', key, e);
    }
  }

  // Also check if standalone quests were stored under old quest key
  try {
    const rawQuests = localStorage.getItem('studyquest_quests');
    if (rawQuests) {
      const parsedQuests = JSON.parse(rawQuests);
      if (Array.isArray(parsedQuests) && parsedQuests.length > 0) {
        const bobby = accountsMap.get(DEFAULT_INITIAL_ACCOUNT.id) || DEFAULT_INITIAL_ACCOUNT;
        if (!bobby.quests || bobby.quests.length === 0) {
          bobby.quests = parsedQuests;
          accountsMap.set(bobby.id, bobby);
        }
      }
    }
  } catch (e) {
    console.warn('Error reading standalone quests', e);
  }

  return Array.from(accountsMap.values());
};

// Helper to load initial active account (always defaults to Bobby Jr. the third)
const loadInitialActiveAccount = (allAccounts: UserAccount[]): UserAccount => {
  let activeId: string | null = null;
  for (const key of FALLBACK_ACTIVE_KEYS) {
    const val = localStorage.getItem(key);
    if (val) {
      activeId = val;
      break;
    }
  }

  if (activeId) {
    const found = allAccounts.find((a) => a.id === activeId);
    if (found) return found;
  }

  // Find Bobby Jr. the third by name or ID
  const bobby = allAccounts.find(
    (a) => a.id === 'user-bobby-jr-the-third' || a.name.toLowerCase().includes('bobby jr')
  );
  if (bobby) return bobby;

  return allAccounts[0] || DEFAULT_INITIAL_ACCOUNT;
};

export default function App() {
  // Accounts directory in localStorage with multi-version fallback
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    return loadAllPersistedAccounts();
  });

  // Current active user account (always defaults instantly to Bobby Jr. the third)
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(() => {
    const initialAccounts = loadAllPersistedAccounts();
    return loadInitialActiveAccount(initialAccounts);
  });

  // Settings state in localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(PRIMARY_STORAGE_KEY_SETTINGS) ||
                    localStorage.getItem('studyquest_settings_v5') ||
                    localStorage.getItem('studyquest_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'create-new-quest'>('dashboard');

  // Active student's quests and stats
  const [quests, setQuests] = useState<Quest[]>(() => {
    return currentAccount?.quests || INITIAL_QUESTS;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    return currentAccount?.stats || INITIAL_USER_STATS;
  });

  // Modals state
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active Alarm triggering
  const [ringingAlarmQuest, setRingingAlarmQuest] = useState<Quest | null>(null);
  const dismissedAlarmsRef = useRef<Set<string>>(new Set());

  // Level Up & XP Toasts
  const [levelUpInfo, setLevelUpInfo] = useState<{ isOpen: boolean; level: number; title: string }>({
    isOpen: false,
    level: 1,
    title: 'Novice Scholar',
  });
  const [xpToasts, setXpToasts] = useState<XpToastInfo[]>([]);

  // Guard against overwriting cloud with blank data on initial startup
  const hasLoadedInitialCloudDataRef = useRef(false);
  const isLocalUpdateRef = useRef(false);

  // Keep sound effects in sync with settings
  useEffect(() => {
    setSoundEffectsEnabled(settings.enableSoundEffects);
  }, [settings.enableSoundEffects]);

  // Apply dynamic color theme whenever active user's avatarColor changes
  useEffect(() => {
    if (currentAccount?.avatarColor) {
      applyThemeToDocument(currentAccount.avatarColor);
    } else {
      applyThemeToDocument('bg-[#e0bbe4] text-[#725477]');
    }
  }, [currentAccount?.avatarColor]);

  // Save settings to all localStorage keys
  useEffect(() => {
    try {
      const payload = JSON.stringify(settings);
      localStorage.setItem(PRIMARY_STORAGE_KEY_SETTINGS, payload);
      localStorage.setItem('studyquest_settings_v5', payload);
      localStorage.setItem('studyquest_settings', payload);
    } catch (e) {
      console.error('Failed saving settings', e);
    }
  }, [settings]);

  // When accounts or currentAccount changes, sync to all storage keys
  useEffect(() => {
    try {
      const payload = JSON.stringify(accounts);
      localStorage.setItem(PRIMARY_STORAGE_KEY_ACCOUNTS, payload);
      localStorage.setItem('studyquest_accounts_v5', payload);
      localStorage.setItem('studyquest_accounts', payload);
    } catch (e) {
      console.error('Failed saving accounts', e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      if (currentAccount) {
        localStorage.setItem(PRIMARY_STORAGE_KEY_ACTIVE_USER_ID, currentAccount.id);
        localStorage.setItem('studyquest_active_user_id_v5', currentAccount.id);
      }
    } catch (e) {
      console.error('Failed saving active account ID', e);
    }
  }, [currentAccount]);

  // Synchronize accounts with Cloud Firestore on boot (and pull latest quests)
  useEffect(() => {
    let isMounted = true;
    fetchAllCloudAccounts()
      .then((cloudAccounts) => {
        if (!isMounted) return;
        if (cloudAccounts.length > 0) {
          setAccounts((prev) => {
            const map = new Map<string, UserAccount>();
            prev.forEach((a) => map.set(a.id, a));
            cloudAccounts.forEach((ca) => {
              const existing = map.get(ca.id);
              if (!existing) {
                map.set(ca.id, ca);
              } else {
                // Merge cloud and local, keeping whichever has quests
                const existingQuests = existing.quests || [];
                const cloudQuests = ca.quests || [];
                map.set(ca.id, {
                  ...existing,
                  ...ca,
                  quests: cloudQuests.length >= existingQuests.length ? cloudQuests : existingQuests,
                  stats: ca.stats || existing.stats,
                });
              }
            });
            return Array.from(map.values());
          });

          // If currentAccount is active, ensure we load any remote quests if local has none
          if (currentAccount) {
            const remoteActive = cloudAccounts.find(
              (a) => a.id === currentAccount.id || a.name.toLowerCase() === currentAccount.name.toLowerCase()
            );
            if (remoteActive) {
              if (remoteActive.quests && remoteActive.quests.length > 0 && quests.length === 0) {
                setQuests(remoteActive.quests);
              }
              if (remoteActive.stats) {
                setUserStats(remoteActive.stats);
              }
            }
          }
        }
        hasLoadedInitialCloudDataRef.current = true;
      })
      .catch((err) => {
        console.warn('Cloud sync on start note:', err);
        hasLoadedInitialCloudDataRef.current = true;
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time Cloud Firestore Subscription for multi-device sync
  useEffect(() => {
    if (!currentAccount?.id) return;

    const unsubscribe = subscribeToCloudAccount(currentAccount.id, (cloudAccount) => {
      if (!cloudAccount) return;
      if (isLocalUpdateRef.current) {
        // Skip if this update originated locally in the last tick
        return;
      }

      // Check if remote account has changes
      if (cloudAccount.quests && JSON.stringify(cloudAccount.quests) !== JSON.stringify(quests)) {
        setQuests(cloudAccount.quests);
      }
      if (cloudAccount.stats && JSON.stringify(cloudAccount.stats) !== JSON.stringify(userStats)) {
        setUserStats(cloudAccount.stats);
      }
      if (cloudAccount.settings && JSON.stringify(cloudAccount.settings) !== JSON.stringify(settings)) {
        setSettings((prev) => ({ ...prev, ...cloudAccount.settings }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentAccount?.id]);

  // Whenever quests or userStats update, sync locally AND to Cloud Firestore
  useEffect(() => {
    if (!currentAccount) return;

    const updatedAccount: UserAccount = {
      ...currentAccount,
      stats: userStats,
      quests: quests,
      settings: settings,
      updatedAt: new Date().toISOString(),
    };

    setAccounts((prev) => {
      const idx = prev.findIndex((a) => a.id === updatedAccount.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedAccount;
        return next;
      }
      return [...prev, updatedAccount];
    });

    // Also persist standalone quests so they can never be lost
    try {
      localStorage.setItem('studyquest_quests', JSON.stringify(quests));
    } catch (e) {}

    // Only save to Cloud Firestore once initial cloud sync has resolved
    // or if quests actually contain user data
    if (hasLoadedInitialCloudDataRef.current || quests.length > 0) {
      isLocalUpdateRef.current = true;
      saveAccountToCloud(updatedAccount).catch(() => {});
      const timer = setTimeout(() => {
        isLocalUpdateRef.current = false;
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [quests, userStats, settings]);

  // Login handler
  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentAccount(account);
    setQuests(account.quests || []);
    setUserStats(account.stats || {
      name: account.name,
      title: 'Novice Scholar',
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      streak: 1,
      completedQuestsCount: 0,
    });

    setAccounts((prev) => {
      const exists = prev.some((a) => a.id === account.id);
      if (exists) {
        return prev.map((a) => (a.id === account.id ? account : a));
      }
      return [...prev, account];
    });
  };

  // Logout handler
  const handleLogOut = () => {
    setCurrentAccount(null);
  };

  // Switch account
  const handleSwitchAccount = () => {
    setCurrentAccount(null);
  };

  // Keep selectedQuest in sync if quests list updates
  useEffect(() => {
    if (selectedQuest) {
      const updated = quests.find((q) => q.id === selectedQuest.id);
      if (updated) {
        setSelectedQuest(updated);
      }
    }
  }, [quests]);

  // Alarm clock polling effect (every 10 seconds)
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      quests.forEach((q) => {
        if (q.hasAlarm && q.alarmTime && !q.isCompleted) {
          const alarmKey = `${q.id}-${currentTimeStr}`;
          if (q.alarmTime === currentTimeStr && !dismissedAlarmsRef.current.has(alarmKey)) {
            dismissedAlarmsRef.current.add(alarmKey);
            setRingingAlarmQuest(q);
          }
        }
      });
    };

    const timer = setInterval(checkAlarms, 10000);
    return () => clearInterval(timer);
  }, [quests]);

  // Trigger floating XP toast
  const triggerXpToast = (amount: number, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setXpToasts((prev) => [...prev, { id, amount, message }]);
    setTimeout(() => {
      setXpToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  // Add XP helper & Level Up Check
  const addXP = (amount: number, message: string = 'Quest task completed!') => {
    triggerXpToast(amount, message);
    playTaskCompleteSound();

    setUserStats((prev) => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newThreshold = prev.xpToNextLevel;
      let didLevelUp = false;

      while (newXP >= newThreshold) {
        newXP = newXP - newThreshold;
        newLevel += 1;
        newThreshold = Math.round(newThreshold * 1.25);
        didLevelUp = true;
      }

      const updatedTitle = getTitleForLevel(newLevel);

      if (didLevelUp) {
        setLevelUpInfo({
          isOpen: true,
          level: newLevel,
          title: updatedTitle,
        });

        if (settings.enableConfetti) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#725477', '#fcd7ff', '#FFF5BA', '#9ad5a2', '#d5e3ff', '#facc15'],
          });
        }
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        title: updatedTitle,
        xpToNextLevel: newThreshold,
        completedQuestsCount: prev.completedQuestsCount + 1,
      };
    });
  };

  // COMPLETE AND AUTO-DELETE QUEST UPON FINISHING
  const handleCompleteAndRemoveQuest = (questId: string) => {
    const questToFinish = quests.find((q) => q.id === questId);
    if (!questToFinish) return;

    const reward = questToFinish.xpReward || 150;
    addXP(reward, `Conquered "${questToFinish.title}"! (+${reward} EXP)`);

    if (settings.enableConfetti) {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#725477', '#fcd7ff', '#FFF5BA', '#9ad5a2', '#d5e3ff'],
      });
    }

    // Close detail modal if open for this quest
    if (selectedQuest?.id === questId) {
      setSelectedQuest(null);
    }

    // Auto-delete / remove the quest from active list
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  };

  // Toggle single step inside a quest
  const handleToggleStep = (questId: string, stepId: string) => {
    setQuests((prevQuests) => {
      const targetQuest = prevQuests.find((q) => q.id === questId);
      if (!targetQuest) return prevQuests;

      let toggledToCompleted = false;
      const updatedSteps = targetQuest.steps.map((st) => {
        if (st.id === stepId) {
          toggledToCompleted = !st.completed;
          return { ...st, completed: !st.completed };
        }
        return st;
      });

      const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.completed);

      if (toggledToCompleted) {
        if (allDone && settings.autoCompleteOnAllSteps) {
          // If all steps completed and auto-complete enabled, automatically celebrate and delete quest
          setTimeout(() => {
            handleCompleteAndRemoveQuest(questId);
          }, 600);
          addXP(25, 'Final quest step completed!');
        } else {
          addXP(25, 'Quest step checked off');
        }
      }

      return prevQuests.map((q) => {
        if (q.id !== questId) return q;
        return {
          ...q,
          steps: updatedSteps,
          isCompleted: allDone,
        };
      });
    });
  };

  // Add new step to an existing quest
  const handleAddStep = (questId: string, stepTitle: string) => {
    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (q.id !== questId) return q;
        const newStep = {
          id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: stepTitle,
          completed: false,
        };
        return {
          ...q,
          steps: [...q.steps, newStep],
          isCompleted: false,
        };
      })
    );
  };

  // Delete a step from a quest
  const handleDeleteStep = (questId: string, stepId: string) => {
    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (q.id !== questId) return q;
        const filtered = q.steps.filter((st) => st.id !== stepId);
        return {
          ...q,
          steps: filtered,
        };
      })
    );
  };

  // Create new quest
  const handleCreateQuest = (newQuest: Quest) => {
    setQuests((prev) => [newQuest, ...prev]);
    addXP(50, 'Created new quest!');
  };

  // Delete a quest manually
  const handleDeleteQuest = (questId: string) => {
    if (selectedQuest?.id === questId) {
      setSelectedQuest(null);
    }
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  };

  // Update Account Profile from Settings Modal (Name, Age, School, Grade, Avatar)
  const handleUpdateAccount = (updatedAccount: UserAccount) => {
    setCurrentAccount(updatedAccount);
    if (updatedAccount.name !== userStats.name) {
      setUserStats((prev) => ({ ...prev, name: updatedAccount.name }));
    }
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );
  };

  // Update App Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  // Import Quests handler
  const handleImportQuests = (importedQuests: Quest[]) => {
    setQuests(importedQuests);
    addXP(100, 'Imported study quests successfully!');
  };

  // Reset Quests handler
  const handleResetQuests = () => {
    setQuests(INITIAL_QUESTS);
    triggerXpToast(0, 'Reset to default study quests');
  };

  // If not logged in, render the AuthScreen
  if (!currentAccount) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        existingAccounts={accounts}
      />
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#faf9fb] text-[#1a1c1d] flex ${
        settings.lowPowerMode ? 'low-power-mode' : ''
      } ${settings.compactMode ? 'compact-ui' : ''}`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        userStats={userStats}
        currentAccount={currentAccount}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 min-h-screen flex flex-col w-full">
        {/* Top Header */}
        <Header
          userStats={userStats}
          currentAccount={currentAccount}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogOut={handleLogOut}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          unreadCount={quests.length}
        />

        {/* View Switcher */}
        {currentTab === 'dashboard' ? (
          <Dashboard
            quests={quests}
            onOpenQuestModal={(quest) => setSelectedQuest(quest)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onCompleteAndRemoveQuest={handleCompleteAndRemoveQuest}
            onToggleStepDirect={handleToggleStep}
            onNavigateCreateQuest={() => setCurrentTab('create-new-quest')}
          />
        ) : (
          <CreateQuest
            onCreateQuest={handleCreateQuest}
            onNavigateDashboard={() => setCurrentTab('dashboard')}
          />
        )}
      </div>

      {/* Modals & Dialogs */}
      <QuestDetailModal
        quest={selectedQuest}
        isOpen={Boolean(selectedQuest)}
        onClose={() => setSelectedQuest(null)}
        onToggleStep={handleToggleStep}
        onAddStep={handleAddStep}
        onDeleteStep={handleDeleteStep}
        onCompleteAndRemoveQuest={handleCompleteAndRemoveQuest}
        onDeleteQuest={handleDeleteQuest}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        quests={quests}
        onSelectQuest={(q) => setSelectedQuest(q)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        quests={quests}
        onSelectQuest={(q) => setSelectedQuest(q)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        quests={quests}
        onSelectQuest={(q) => setSelectedQuest(q)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userStats={userStats}
        currentAccount={currentAccount}
        onLogOut={handleLogOut}
        onSwitchAccount={handleSwitchAccount}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentAccount={currentAccount}
        settings={settings}
        quests={quests}
        onUpdateAccount={handleUpdateAccount}
        onUpdateSettings={handleUpdateSettings}
        onImportQuests={handleImportQuests}
        onResetQuests={handleResetQuests}
      />

      <LevelUpModal
        isOpen={levelUpInfo.isOpen}
        onClose={() => setLevelUpInfo((prev) => ({ ...prev, isOpen: false }))}
        newLevel={levelUpInfo.level}
        title={levelUpInfo.title}
      />

      {/* Alarm ringing popup alert */}
      <AlarmNotificationModal
        quest={ringingAlarmQuest}
        isOpen={Boolean(ringingAlarmQuest)}
        onDismiss={() => setRingingAlarmQuest(null)}
        onCompleteQuest={handleCompleteAndRemoveQuest}
      />

      {/* Floating XP Toasts */}
      <XpToast toasts={xpToasts} />
    </div>
  );
}

