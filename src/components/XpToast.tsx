import React from 'react';

export interface XpToastInfo {
  id: string;
  amount: number;
  message: string;
}

interface XpToastProps {
  toasts: XpToastInfo[];
}

export const XpToast: React.FC<XpToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-[#725477] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#e0bbe4]/50 flex items-center gap-3 animate-bounce shadow-[#725477]/30"
        >
          <div className="w-8 h-8 rounded-full bg-[#FFF5BA] text-[#1a1c1d] flex items-center justify-center font-bold text-xs shrink-0">
            <span className="material-symbols-outlined text-[18px] text-yellow-600">
              bolt
            </span>
          </div>
          <div>
            <div className="text-xs font-black tracking-wide text-yellow-300">
              +{toast.amount} EXP GAINED!
            </div>
            <div className="text-xs font-medium text-white/90 truncate max-w-[200px]">
              {toast.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
