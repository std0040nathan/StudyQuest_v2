import React from 'react';
import { UserStats, UserAccount } from '../types';

interface HeaderProps {
  userStats: UserStats;
  currentAccount?: UserAccount | null;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogOut?: () => void;
  onToggleMobileMenu?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  userStats,
  currentAccount,
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  onOpenSettings,
  onLogOut,
  onToggleMobileMenu,
  unreadCount = 0,
}) => {
  const isNobody =
    userStats.name.toLowerCase().includes('nobody') ||
    (currentAccount?.name && currentAccount.name.toLowerCase().includes('nobody')) ||
    currentAccount?.id === 'user-nobody' ||
    userStats.name.toLowerCase().includes('bobby');

  return (
    <header
      id="app-header"
      style={{
        borderBottomColor: 'var(--theme-subtle-border)',
      }}
      className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#faf9fb]/70 backdrop-blur-xl z-40 px-6 sm:px-12 lg:px-16 flex items-center justify-between border-b"
    >
      {/* Title & Greeting / Mobile Hamburger */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            style={{ color: 'var(--theme-primary)' }}
            className="lg:hidden p-2 rounded-xl hover:bg-black/5 transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}
        <div className="flex flex-col min-w-0">
          <h1
            style={{ color: 'var(--theme-primary)' }}
            className="text-sm sm:text-base md:text-lg lg:text-[20px] font-bold flex items-center gap-1.5 tracking-tight leading-snug"
          >
            {isNobody ? (
              <span className="truncate sm:whitespace-normal">
                Please log in unless you wish to stay in nobody’s account
              </span>
            ) : (
              <span>Welcome back, {userStats.name}</span>
            )}
            <span className="material-symbols-outlined text-[#facc15] text-[18px] sm:text-[22px] drop-shadow-sm select-none shrink-0">
              stars
            </span>
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#4c444c]/85">
            <span>Ready for today&apos;s quests?</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#725477] font-semibold bg-[#e0bbe4]/25 px-2 py-0.5 rounded-full" title="Cloud multi-device sync active">
              <span className="material-symbols-outlined text-[13px] text-green-600">cloud_done</span>
              <span>Synced</span>
            </span>
            {isNobody && onLogOut && (
              <button
                onClick={onLogOut}
                className="text-[11px] font-bold text-[#725477] hover:underline underline-offset-2 flex items-center gap-0.5 ml-1"
                title="Switch to another account"
              >
                <span>(Switch Account)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button */}
        <button
          id="btn-header-search"
          onClick={onOpenSearch}
          aria-label="Search quests and notes"
          style={{ color: 'var(--theme-primary)' }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all"
          title="Search Quests"
        >
          <span className="material-symbols-outlined text-[22px]">search</span>
        </button>

        {/* Notification bell */}
        <button
          id="btn-header-notifications"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          style={{ color: 'var(--theme-primary)' }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all relative"
          title="Notifications & Alarms"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Settings button */}
        <button
          id="btn-header-settings"
          onClick={onOpenSettings}
          aria-label="Settings and Performance"
          style={{ color: 'var(--theme-primary)' }}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all"
          title="Settings (Grade, Performance & Audio)"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </button>

        {/* Profile Avatar Button */}
        <button
          id="btn-header-profile"
          onClick={onOpenProfile}
          aria-label="View user profile"
          className={`w-9 h-9 rounded-full ${
            currentAccount?.avatarColor || 'bg-theme-primary text-white'
          } hover:opacity-90 flex items-center justify-center ml-1 sm:ml-2 shadow-md transition-all active:scale-95 ring-2 ring-transparent hover:ring-theme-primary`}
          title={`${userStats.name} (${currentAccount?.grade || 'Scholar'}, ${currentAccount?.school || 'Bina Bangsa'}) - View Profile`}
        >
          <span className="material-symbols-outlined text-[19px]">
            {currentAccount?.avatarIcon || 'person'}
          </span>
        </button>

        {onLogOut && (
          <button
            onClick={onLogOut}
            title="Log out or switch account"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 text-[#4c444c] hover:text-red-600 transition-all ml-1"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        )}
      </div>
    </header>
  );
};

