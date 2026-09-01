import React from 'react';
import { UserStats, UserAccount } from '../types';

interface SidebarProps {
  currentTab: 'dashboard' | 'create-new-quest';
  onSelectTab: (tab: 'dashboard' | 'create-new-quest') => void;
  userStats: UserStats;
  currentAccount?: UserAccount | null;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userStats,
  currentAccount,
  onOpenProfile,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const xpPercent = Math.min(100, Math.round((userStats.xp / userStats.xpToNextLevel) * 100));

  const handleTabClick = (tab: 'dashboard' | 'create-new-quest') => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed left-0 top-0 h-screen w-72 bg-[#faf9fb] lg:bg-[#faf9fb]/90 backdrop-blur-md z-50 flex flex-col border-r border-[#e0bbe4]/40 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-8 py-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[32px] animate-pulse"
              style={{ color: 'var(--theme-primary)' }}
            >
              auto_awesome
            </span>
            <span
              className="font-['Quicksand'] font-bold text-2xl tracking-tight"
              style={{ color: 'var(--theme-primary)' }}
            >
              StudyQuest
            </span>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-full text-[#4c444c] hover:bg-black/5"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Options */}
        <nav className="flex-1 px-4 space-y-2" id="sidebar-nav">
          {/* Option 1: Dashboard */}
          <button
            id="nav-btn-dashboard"
            onClick={() => handleTabClick('dashboard')}
            style={
              currentTab === 'dashboard'
                ? {
                    backgroundColor: 'var(--theme-soft)',
                    color: 'var(--theme-text-dark)',
                    boxShadow: '0 4px 20px var(--theme-shadow)',
                  }
                : undefined
            }
            className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-200 group text-left ${
              currentTab === 'dashboard'
                ? 'font-bold'
                : 'text-[#4c444c] hover:bg-black/5 font-medium'
            }`}
          >
            <span className="material-symbols-outlined mr-5 text-[22px] transition-transform group-active:scale-95">
              grid_view
            </span>
            <span className="font-['Quicksand'] text-[16px]">Dashboard</span>
          </button>

          {/* Option 2: Create New Quest */}
          <button
            id="nav-btn-create-quest"
            onClick={() => handleTabClick('create-new-quest')}
            style={
              currentTab === 'create-new-quest'
                ? {
                    backgroundColor: 'var(--theme-soft)',
                    color: 'var(--theme-text-dark)',
                    boxShadow: '0 4px 20px var(--theme-shadow)',
                  }
                : undefined
            }
            className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-200 group text-left ${
              currentTab === 'create-new-quest'
                ? 'font-bold'
                : 'text-[#4c444c] hover:bg-black/5 font-medium'
            }`}
          >
            <span className="material-symbols-outlined mr-5 text-[22px] transition-transform group-active:scale-95">
              add_circle
            </span>
            <span className="font-['Quicksand'] text-[16px]">Create New Quest</span>
          </button>

          {/* Option 3: Settings */}
          {onOpenSettings && (
            <button
              id="nav-btn-settings"
              onClick={() => {
                onOpenSettings();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center px-6 py-4 rounded-xl transition-all duration-200 group text-left text-[#4c444c] hover:bg-black/5 font-medium"
            >
              <span className="material-symbols-outlined mr-5 text-[22px] transition-transform group-active:scale-95">
                settings
              </span>
              <span className="font-['Quicksand'] text-[16px]">Settings</span>
            </button>
          )}
        </nav>

        {/* User Status / Explorer Mode Card */}
        <div className="px-4 pb-8">
          <div
            id="user-status-card"
            onClick={onOpenProfile}
            style={{
              backgroundColor: 'var(--theme-subtle)',
              borderColor: 'var(--theme-subtle-border)',
            }}
            className="p-4 rounded-2xl border shadow-xs flex flex-col gap-2.5 transition-all hover:opacity-90 cursor-pointer group/user"
            title="Click to view full student profile"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-9 h-9 rounded-full ${
                  currentAccount?.avatarColor || 'bg-theme-primary text-white'
                } flex items-center justify-center shrink-0 shadow-md`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {currentAccount?.avatarIcon || 'person'}
                </span>
              </div>
              <div className="overflow-hidden flex-1">
                <p
                  className="text-[14px] font-bold truncate group-hover/user:underline"
                  style={{ color: 'var(--theme-text-dark)' }}
                >
                  {userStats.title}
                </p>
                <div
                  className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold opacity-80"
                  style={{ color: 'var(--theme-text-dark)' }}
                >
                  <span>Level {userStats.level}</span>
                  <span>{xpPercent}%</span>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${xpPercent}%`,
                  backgroundColor: 'var(--theme-primary)',
                }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

