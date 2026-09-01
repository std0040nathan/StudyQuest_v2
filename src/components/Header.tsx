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
  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#faf9fb]/70 backdrop-blur-xl z-40 px-6 sm:px-12 lg:px-16 flex items-center justify-between border-b border-[#e0bbe4]/20"
    >
      {/* Title & Greeting / Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#725477] hover:bg-[#e0bbe4]/20 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl lg:text-[22px] font-bold text-[#725477] flex items-center gap-1.5 tracking-tight">
            <span>Welcome back, {userStats.name}</span>
            <span className="material-symbols-outlined text-[#facc15] text-[20px] sm:text-[22px] drop-shadow-sm select-none">
              stars
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4c444c]/85">
            Ready for today&apos;s quests?
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search button */}
        <button
          id="btn-header-search"
          onClick={onOpenSearch}
          aria-label="Search quests and notes"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e0bbe4]/25 active:scale-95 transition-all text-[#725477]"
          title="Search Quests"
        >
          <span className="material-symbols-outlined text-[22px]">search</span>
        </button>

        {/* Notification bell */}
        <button
          id="btn-header-notifications"
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e0bbe4]/25 active:scale-95 transition-all relative text-[#725477]"
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
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e0bbe4]/25 active:scale-95 transition-all text-[#725477]"
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
            currentAccount?.avatarColor || 'bg-[#725477] text-white'
          } hover:ring-4 hover:ring-[#e0bbe4]/50 flex items-center justify-center ml-1 sm:ml-2 shadow-md transition-all active:scale-95`}
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

