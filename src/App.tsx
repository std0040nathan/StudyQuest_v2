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
import { LevelUpModal } from './components/LevelUpModal';
import { AlarmNotificationModal } from './components/AlarmNotificationModal';
import { XpToast, XpToastInfo } from './components/XpToast';
import { INITIAL_QUESTS, INITIAL_USER_STATS } from './data/initialQuests';
import { Quest, UserStats } from './types';
import { playTaskCompleteSound } from './utils/audio';

const STORAGE_KEY_QUESTS = 'studyquest_quests_v3';
const STORAGE_KEY_STATS = 'studyquest_stats_v3';

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
  'Sage of Reminders',
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'create-new-quest'>('dashboard');

  // Load persistent state
  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_QUESTS;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_STATS;
  });

  // Modals state
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active Alarm triggering
  const [ringingAlarmQuest, setRingingAlarmQuest] = useState<Quest | null>(null);
  const dismissedAlarmsRef = useRef<Set<string>>(new Set());

  // Level Up & XP Toasts
  const [levelUpInfo, setLevelUpInfo] = useState<{ isOpen: boolean; level: number; title: string }>({
    isOpen: false,
    level: 12,
    title: 'Explorer Mode',
  });
  const [xpToasts, setXpToasts] = useState<XpToastInfo[]>([]);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(quests));
    } catch (e) {
      console.error('Failed saving quests', e);
    }
  }, [quests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(userStats));
    } catch (e) {
      console.error('Failed saving user stats', e);
    }
  }, [userStats]);

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
  const addXP = (amount: number, message: string = 'Task completed!') => {
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

    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#725477', '#fcd7ff', '#FFF5BA', '#9ad5a2', '#d5e3ff'],
    });

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
        if (allDone) {
          // If all steps completed, automatically celebrate and delete quest after brief delay
          setTimeout(() => {
            handleCompleteAndRemoveQuest(questId);
          }, 600);
          addXP(25, 'Final step completed!');
        } else {
          addXP(25, 'Step checked off');
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
    addXP(50, 'Created new reminder!');
  };

  // Delete a quest manually
  const handleDeleteQuest = (questId: string) => {
    if (selectedQuest?.id === questId) {
      setSelectedQuest(null);
    }
    setQuests((prev) => prev.filter((q) => q.id !== questId));
  };

  return (
    <div className="min-h-screen bg-[#faf9fb] text-[#1a1c1d] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        userStats={userStats}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 min-h-screen flex flex-col w-full">
        {/* Top Header */}
        <Header
          userStats={userStats}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
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
