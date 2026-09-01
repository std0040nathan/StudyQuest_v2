export interface ThemeConfig {
  id: string;
  label: string;
  avatarClass: string;
  primary: string;
  primaryHover: string;
  soft: string;
  subtle: string;
  subtleBorder: string;
  textDark: string;
  shadow: string;
  ring: string;
  confetti: string[];
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'purple',
    label: 'Lilac',
    avatarClass: 'bg-[#e0bbe4] text-[#725477]',
    primary: '#725477',
    primaryHover: '#593d5f',
    soft: '#e0bbe4',
    subtle: '#faf4fc',
    subtleBorder: 'rgba(224, 187, 228, 0.45)',
    textDark: '#5d3d63',
    shadow: 'rgba(114, 84, 119, 0.2)',
    ring: '#725477',
    confetti: ['#725477', '#e0bbe4', '#b1cdfd', '#FFF5BA', '#9ad5a2'],
  },
  {
    id: 'blue',
    label: 'Sky Blue',
    avatarClass: 'bg-[#d5e3ff] text-[#2b4770]',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    soft: '#bfdbfe',
    subtle: '#f0f7ff',
    subtleBorder: 'rgba(191, 219, 254, 0.55)',
    textDark: '#1e3a8a',
    shadow: 'rgba(37, 99, 235, 0.2)',
    ring: '#2563eb',
    confetti: ['#2563eb', '#bfdbfe', '#93c5fd', '#FFF5BA', '#86efac'],
  },
  {
    id: 'mint',
    label: 'Fresh Mint',
    avatarClass: 'bg-[#b5f1bc] text-[#18512a]',
    primary: '#16a34a',
    primaryHover: '#15803d',
    soft: '#bbf7d0',
    subtle: '#f0fdf4',
    subtleBorder: 'rgba(187, 247, 208, 0.55)',
    textDark: '#14532d',
    shadow: 'rgba(22, 163, 74, 0.2)',
    ring: '#16a34a',
    confetti: ['#16a34a', '#bbf7d0', '#86efac', '#fef08a', '#93c5fd'],
  },
  {
    id: 'butter',
    label: 'Butter / Gold',
    avatarClass: 'bg-[#FFF5BA] text-[#854d0e]',
    primary: '#d97706',
    primaryHover: '#b45309',
    soft: '#fef08a',
    subtle: '#fefce8',
    subtleBorder: 'rgba(254, 240, 138, 0.65)',
    textDark: '#78350f',
    shadow: 'rgba(217, 119, 6, 0.2)',
    ring: '#d97706',
    confetti: ['#d97706', '#fef08a', '#fde047', '#bbf7d0', '#fed7aa'],
  },
  {
    id: 'pink',
    label: 'Candy Pink',
    avatarClass: 'bg-[#fcd7ff] text-[#725477]',
    primary: '#db2777',
    primaryHover: '#be185d',
    soft: '#fbcfe8',
    subtle: '#fdf2f8',
    subtleBorder: 'rgba(251, 207, 232, 0.55)',
    textDark: '#831843',
    shadow: 'rgba(219, 39, 119, 0.2)',
    ring: '#db2777',
    confetti: ['#db2777', '#fbcfe8', '#f472b6', '#FFF5BA', '#c4b5fd'],
  },
  {
    id: 'coral',
    label: 'Sunset Coral',
    avatarClass: 'bg-[#ffd8d8] text-[#8c2a2a]',
    primary: '#e11d48',
    primaryHover: '#be123c',
    soft: '#fecdd3',
    subtle: '#fff1f2',
    subtleBorder: 'rgba(254, 205, 211, 0.55)',
    textDark: '#881337',
    shadow: 'rgba(225, 29, 72, 0.2)',
    ring: '#e11d48',
    confetti: ['#e11d48', '#fecdd3', '#fda4af', '#fde047', '#fed7aa'],
  },
  {
    id: 'teal',
    label: 'Ocean Teal',
    avatarClass: 'bg-[#ccfbf1] text-[#115e59]',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    soft: '#99f6e4',
    subtle: '#f0fdfa',
    subtleBorder: 'rgba(153, 246, 228, 0.55)',
    textDark: '#134e4a',
    shadow: 'rgba(13, 148, 136, 0.2)',
    ring: '#0d9488',
    confetti: ['#0d9488', '#99f6e4', '#5eead4', '#fef08a', '#93c5fd'],
  },
  {
    id: 'indigo',
    label: 'Cosmic Indigo',
    avatarClass: 'bg-[#e0e7ff] text-[#3730a3]',
    primary: '#6366f1',
    primaryHover: '#4f46e5',
    soft: '#c7d2fe',
    subtle: '#eef2ff',
    subtleBorder: 'rgba(199, 210, 254, 0.55)',
    textDark: '#312e81',
    shadow: 'rgba(99, 102, 241, 0.2)',
    ring: '#6366f1',
    confetti: ['#6366f1', '#c7d2fe', '#818cf8', '#fde047', '#a7f3d0'],
  },
];

export const getThemeConfig = (avatarClass?: string): ThemeConfig => {
  if (!avatarClass) return THEMES[0];
  const matched = THEMES.find((t) => {
    if (t.avatarClass === avatarClass) return true;
    if (avatarClass.includes(t.id)) return true;
    return false;
  });
  if (matched) return matched;

  // Partial matches
  if (avatarClass.includes('d5e3ff') || avatarClass.includes('b1cdfd') || avatarClass.includes('blue')) {
    return THEMES[1];
  }
  if (avatarClass.includes('b5f1bc') || avatarClass.includes('mint') || avatarClass.includes('green')) {
    return THEMES[2];
  }
  if (avatarClass.includes('FFF5BA') || avatarClass.includes('yellow') || avatarClass.includes('butter')) {
    return THEMES[3];
  }
  if (avatarClass.includes('fcd7ff') || avatarClass.includes('pink')) {
    return THEMES[4];
  }
  if (avatarClass.includes('ffd8d8') || avatarClass.includes('red') || avatarClass.includes('coral')) {
    return THEMES[5];
  }
  if (avatarClass.includes('ccfbf1') || avatarClass.includes('teal')) {
    return THEMES[6];
  }
  if (avatarClass.includes('e0e7ff') || avatarClass.includes('indigo')) {
    return THEMES[7];
  }
  return THEMES[0];
};

export const applyThemeToDocument = (themeInput?: ThemeConfig | string) => {
  if (typeof document === 'undefined') return;
  const theme = typeof themeInput === 'object' && themeInput !== null
    ? themeInput
    : getThemeConfig(typeof themeInput === 'string' ? themeInput : undefined);

  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.primary);
  root.style.setProperty('--theme-primary-hover', theme.primaryHover);
  root.style.setProperty('--theme-soft', theme.soft);
  root.style.setProperty('--theme-subtle', theme.subtle);
  root.style.setProperty('--theme-subtle-border', theme.subtleBorder);
  root.style.setProperty('--theme-text-dark', theme.textDark);
  root.style.setProperty('--theme-shadow', theme.shadow);
  root.style.setProperty('--theme-ring', theme.ring);
};
