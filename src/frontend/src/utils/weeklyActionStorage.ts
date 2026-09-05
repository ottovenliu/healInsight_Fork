/**
 * Weekly Micro-Action Completion Storage Utility
 * Stored in browser localStorage under 'healsight_weekly_action_completions'
 * Partitioned by:
 * {
 *   [profileId: string]: {
 *     [actionId: string]: boolean
 *   }
 * }
 */

export const WEEKLY_ACTION_STORAGE_KEY = 'healsight_weekly_action_completions';

export type WeeklyCompletionMap = {
  [profileId: string]: {
    [actionId: string]: boolean;
  };
};

export const loadWeeklyActionCompletions = (): WeeklyCompletionMap => {
  try {
    const raw = localStorage.getItem(WEEKLY_ACTION_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as WeeklyCompletionMap;
  } catch (err) {
    console.error('Failed to load weekly action completions from localStorage:', err);
    return {};
  }
};

export const saveWeeklyActionCompletions = (map: WeeklyCompletionMap): void => {
  try {
    localStorage.setItem(WEEKLY_ACTION_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save weekly action completions to localStorage:', err);
  }
};

export const getWeeklyActionCompletion = (profileId: string, actionId: string): boolean => {
  const map = loadWeeklyActionCompletions();
  return !!map[profileId]?.[actionId];
};

export const toggleWeeklyActionCompletion = (profileId: string, actionId: string): boolean => {
  const map = loadWeeklyActionCompletions();
  if (!map[profileId]) {
    map[profileId] = {};
  }
  const current = !!map[profileId][actionId];
  const next = !current;
  map[profileId][actionId] = next;
  saveWeeklyActionCompletions(map);
  return next;
};

export const clearWeeklyActionCompletions = (): void => {
  try {
    localStorage.removeItem(WEEKLY_ACTION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear weekly action completions:', err);
  }
};
