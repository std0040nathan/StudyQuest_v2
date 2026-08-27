import { Quest } from '../types';

/**
 * Parses deadline date and time into a Date object.
 * e.g. deadline: "2026-08-27", deadlineTime: "16:00" -> Date
 */
export function getDeadlineDateTime(deadline: string, deadlineTime?: string): Date {
  if (!deadline) return new Date();
  const timeStr = deadlineTime && deadlineTime.includes(':') ? deadlineTime : '23:59';
  const [year, month, day] = deadline.split('-').map((n) => parseInt(n, 10));
  const [hours, minutes] = timeStr.split(':').map((n) => parseInt(n, 10));
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0);
}

/**
 * Returns dynamic remaining time info:
 * - isUrgent: within next 24 hours
 * - isApproaching: within next 72 hours (3 days)
 * - isOverdue: deadline has passed
 * - humanRemaining: e.g. "in 3 hours", "in 45 mins", "Tomorrow at 4:00 PM", "in 2 days", "Overdue by 1h"
 */
export function getDeadlineUrgency(quest: Quest, now: Date = new Date()) {
  const target = getDeadlineDateTime(quest.deadline, quest.deadlineTime);
  const diffMs = target.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffDays = Math.floor(diffHours / 24);

  const isOverdue = diffMs < 0;
  const isApproaching = diffHours <= 72 && !isOverdue; // within 3 days
  const isUrgent = diffHours <= 24 && !isOverdue; // within 24 hours
  const isImminent = diffHours <= 3 && !isOverdue; // within 3 hours

  let humanRemaining = '';
  if (isOverdue) {
    const overdueMins = Math.abs(diffMinutes);
    if (overdueMins < 60) {
      humanRemaining = `Overdue by ${overdueMins}m`;
    } else {
      const overdueHours = Math.floor(overdueMins / 60);
      humanRemaining = `Overdue by ${overdueHours}h`;
    }
  } else if (diffMinutes < 60) {
    humanRemaining = `Due in ${Math.max(1, diffMinutes)}m`;
  } else if (diffHours < 24) {
    const hrs = Math.floor(diffHours);
    const mins = diffMinutes % 60;
    humanRemaining = mins > 0 ? `Due in ${hrs}h ${mins}m` : `Due in ${hrs}h`;
  } else if (diffDays === 1) {
    humanRemaining = `Tomorrow at ${quest.deadlineTimeFormatted || 'end of day'}`;
  } else if (diffDays < 7) {
    humanRemaining = `Due in ${diffDays} days`;
  } else {
    humanRemaining = `${quest.deadlineFormatted || quest.deadline}`;
  }

  return {
    target,
    diffMs,
    diffHours,
    diffMinutes,
    diffDays,
    isOverdue,
    isApproaching,
    isUrgent,
    isImminent,
    humanRemaining,
  };
}
