import React, { useState, useMemo } from 'react';
import { Quest } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  onSelectQuest: (quest: Quest) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  quests,
  onSelectQuest,
}) => {
  const [query, setQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  const subjects = useMemo(() => {
    const set = new Set<string>();
    quests.forEach((q) => {
      if (q.subject) set.add(q.subject);
    });
    return ['All', ...Array.from(set)];
  }, [quests]);

  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      const matchQuery =
        q.title.toLowerCase().includes(query.toLowerCase()) ||
        q.subject.toLowerCase().includes(query.toLowerCase()) ||
        q.details.toLowerCase().includes(query.toLowerCase()) ||
        q.type.toLowerCase().includes(query.toLowerCase());
      const matchSubject = selectedSubject === 'All' || q.subject === selectedSubject;
      return matchQuery && matchSubject;
    });
  }, [quests, query, selectedSubject]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="search-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e0bbe4]/30 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#eeedef] bg-[#faf9fb] flex items-center gap-3">
          <span
            style={{ color: 'var(--theme-primary)' }}
            className="material-symbols-outlined text-[24px]"
          >
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quests, subjects, or homework details..."
            autoFocus
            className="flex-1 bg-transparent text-[#1a1c1d] text-base placeholder:text-[#4c444c]/40 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-[#4c444c]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Subject Filter Pills */}
        <div className="px-4 py-2 bg-[#faf9fb] border-b border-[#eeedef] flex items-center gap-2 overflow-x-auto">
          {subjects.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                style={
                  isSelected
                    ? { backgroundColor: 'var(--theme-primary)', color: '#ffffff' }
                    : {}
                }
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'shadow-xs'
                    : 'bg-[#eeedef] text-[#4c444c] hover:bg-black/5'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredQuests.length === 0 ? (
            <div className="text-center py-12 text-[#4c444c]">
              <span className="material-symbols-outlined text-4xl text-[#cfc3cc] mb-2">
                travel_explore
              </span>
              <p className="text-sm font-medium">No matching quests found.</p>
            </div>
          ) : (
            filteredQuests.map((q) => (
              <div
                key={q.id}
                onClick={() => {
                  onSelectQuest(q);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#faf9fb] border border-transparent hover:border-theme-primary transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      style={{
                        backgroundColor: 'var(--theme-subtle)',
                        color: 'var(--theme-primary)',
                      }}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                    >
                      {q.type}
                    </span>
                    <span className="text-[11px] font-semibold text-[#4c444c]">{q.subject}</span>
                  </div>
                  <h4 className="font-bold text-[#1a1c1d] group-hover:text-theme-primary transition-colors text-sm">
                    {q.title}
                  </h4>
                  <p className="text-xs text-[#4c444c]/80 line-clamp-1">{q.details}</p>
                </div>
                <span className="material-symbols-outlined text-[#cfc3cc] group-hover:text-theme-primary">
                  arrow_forward
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
