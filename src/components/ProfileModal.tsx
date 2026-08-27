import React from 'react';
import { UserStats } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userStats,
}) => {
  if (!isOpen) return null;

  const badges = [
    { title: 'Homework Slayer', icon: 'menu_book', color: 'bg-[#d5e3ff] text-[#001c3b]', desc: 'Completed 15+ homework tasks' },
    { title: 'Quiz Master', icon: 'psychology', color: 'bg-[#FFF5BA] text-[#854d0e]', desc: 'Conquered 5 test reviews' },
    { title: 'Consistency King', icon: 'local_fire_department', color: 'bg-[#b5f1bc] text-[#18512a]', desc: '5 days active streak' },
    { title: 'Grand Planner', icon: 'stars', color: 'bg-[#fcd7ff] text-[#2a1131]', desc: 'Created 20+ study quests' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="profile-modal"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#e0bbe4]/30 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with avatar */}
        <div className="p-6 bg-gradient-to-br from-[#e0bbe4]/40 to-[#d5e3ff]/40 text-center relative border-b border-[#eeedef]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#4c444c]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="w-20 h-20 rounded-full bg-[#725477] text-white flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-white">
            <span className="material-symbols-outlined text-[40px]">person</span>
          </div>

          <h3 className="text-xl font-bold text-[#1a1c1d]">{userStats.name}</h3>
          <p className="text-sm font-semibold text-[#725477]">{userStats.title} · Level {userStats.level}</p>

          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs font-bold text-[#4c444c] mb-1">
              <span>XP Progress</span>
              <span>{userStats.xp} / {userStats.xpToNextLevel} XP</span>
            </div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-[#725477] rounded-full"
                style={{ width: `${Math.min(100, (userStats.xp / userStats.xpToNextLevel) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#faf9fb] rounded-xl border border-[#eeedef]">
              <div className="text-xl font-bold text-[#725477]">{userStats.streak}</div>
              <div className="text-[11px] font-semibold text-[#4c444c]">Day Streak</div>
            </div>
            <div className="p-3 bg-[#faf9fb] rounded-xl border border-[#eeedef]">
              <div className="text-xl font-bold text-[#445f89]">{userStats.completedQuestsCount}</div>
              <div className="text-[11px] font-semibold text-[#4c444c]">Quests Done</div>
            </div>
            <div className="p-3 bg-[#faf9fb] rounded-xl border border-[#eeedef]">
              <div className="text-xl font-bold text-[#326940]">{userStats.level}</div>
              <div className="text-[11px] font-semibold text-[#4c444c]">Scholar Rank</div>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h4 className="text-xs font-bold text-[#4c444c] uppercase tracking-wider mb-2">
              Unlocked Badges
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {badges.map((b, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[#faf9fb] border border-[#eeedef] flex items-center gap-2.5"
                >
                  <div className={`w-8 h-8 rounded-lg ${b.color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[18px]">{b.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1a1c1d] truncate">{b.title}</p>
                    <p className="text-[10px] text-[#4c444c] truncate">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-[#eeedef] bg-[#faf9fb] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#725477] text-white text-xs font-bold rounded-xl hover:bg-[#593d5f] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
