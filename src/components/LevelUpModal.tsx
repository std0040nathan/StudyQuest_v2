import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playLevelUpSound } from '../utils/audio';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  title: string;
}

const MOTIVATIONAL_QUOTES = [
  "Levelling up does virtually nothing, but your dedication is undeniable!",
  "Statistically proven to grant 0 extra superpowers, but 100% extra dopamine!",
  "You conquered another milestone. Keep that momentum roaring!",
  "Another level in the books! Your productivity is on absolute fire.",
  "No actual magic acquired, but you're definitively sharper than yesterday!",
];

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  title,
}) => {
  useEffect(() => {
    if (isOpen) {
      playLevelUpSound();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#725477', '#fcd7ff', '#FFF5BA', '#9ad5a2', '#d5e3ff'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quote = MOTIVATIONAL_QUOTES[(newLevel - 1) % MOTIVATIONAL_QUOTES.length];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="level-up-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-[#e0bbe4] overflow-hidden flex flex-col text-center p-8 relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background glow circle */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#FFF5BA]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#fcd7ff]/60 rounded-full blur-3xl pointer-events-none" />

        {/* Level Icon Badge */}
        <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#725477] to-[#9b72a0] text-white flex flex-col items-center justify-center shadow-lg shadow-[#725477]/30 mb-4 transform hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[36px] text-yellow-300 animate-bounce">
            military_tech
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">
            Level
          </span>
          <span className="text-2xl font-black leading-none">{newLevel}</span>
        </div>

        {/* Celebration Title */}
        <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF5BA] text-[#1a1c1d] text-xs font-bold uppercase tracking-wider mx-auto mb-2 border border-yellow-300">
          <span className="material-symbols-outlined text-[16px] text-yellow-600">
            stars
          </span>
          <span>Level Up!</span>
        </div>

        <h3 className="text-2xl font-black text-[#1a1c1d] tracking-tight mb-1">
          You Reached Level {newLevel}!
        </h3>

        <p className="text-sm font-bold text-[#725477] mb-4">
          Title Unlocked: <span className="underline decoration-wavy decoration-[#e0bbe4]">{title}</span>
        </p>

        {/* Motivational Card */}
        <div className="bg-[#faf9fb] rounded-2xl p-4 border border-[#eeedef] mb-6 text-xs font-medium text-[#4c444c] leading-relaxed">
          &ldquo;{quote}&rdquo;
        </div>

        {/* Action button */}
        <button
          id="btn-claim-levelup"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#725477] hover:bg-[#593d5f] text-white text-sm font-bold transition-all shadow-md shadow-[#725477]/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Keep Conquering!</span>
          <span className="material-symbols-outlined text-[20px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};
