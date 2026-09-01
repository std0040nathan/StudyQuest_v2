export interface QuestStep {
  id: string;
  title: string;
  completed: boolean;
}

export type QuestType = 'Homework' | 'Test' | 'Project' | 'Quiz' | 'Assignment' | 'Exam' | 'Study Session' | string;

export type SchoolSubject =
  | 'Math'
  | 'English'
  | 'Science'
  | 'Chinese'
  | 'Bahasa Indo'
  | 'Computer Science (CS)'
  | 'Art'
  | string;

export interface Quest {
  id: string;
  title: string;
  subject: SchoolSubject;
  type: QuestType;
  deadline: string; // ISO format "YYYY-MM-DD"
  deadlineDay: number; // Day of the month for display
  deadlineFormatted: string; // e.g. "Aug 28"
  deadlineTime?: string; // e.g. "15:30" (24hr) or "11:59 PM"
  deadlineTimeFormatted?: string; // e.g. "3:30 PM"
  hasAlarm?: boolean; // Alarm active flag
  alarmTime?: string; // e.g. "15:00"
  alarmTimeFormatted?: string; // e.g. "3:00 PM"
  details: string;
  steps: QuestStep[];
  isCompleted: boolean;
  isToday: boolean;
  colorTheme?: 'purple' | 'blue' | 'yellow' | 'green';
  xpReward: number;
  createdAt: string;
}

export interface UserStats {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  completedQuestsCount: number;
}

export interface AppSettings {
  // Student & Profile settings
  age?: number;
  grade?: string;
  school?: string;
  dailyStudyGoalHours?: number;
  
  // Performance settings
  lowPowerMode: boolean; // Disables heavy blur/animations for school Chromebooks/low-spec devices
  enableAnimations: boolean; // Master toggle for motion and transitions
  enableConfetti: boolean; // Particle bursts on level up and quest completion
  enableSoundEffects: boolean; // Audio synthesizer feedback
  compactMode: boolean; // Denser layout for smaller screens
  
  // Workflow settings
  autoCompleteOnAllSteps: boolean;
  defaultAlarmLeadMinutes: number; // e.g. 0, 15, 30, 60
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  age?: number;
  school?: string;
  grade?: string;
  avatarIcon?: string;
  avatarColor?: string;
  settings?: Partial<AppSettings>;
  stats: UserStats;
  quests: Quest[];
  createdAt: string;
  updatedAt?: string;
}
