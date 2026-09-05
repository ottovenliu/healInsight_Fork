/**
 * Action Storage & Weekly Completion Utility
 *
 * Architecture Specification:
 * - Production Server Database: Persists profile saved micro-actions (biomarkerKey, title, category, description)
 * - Browser LocalStorage: Persists weekly completion status ('healsight_weekly_action_completions')
 */

import { getWeeklyActionCompletion, toggleWeeklyActionCompletion } from './weeklyActionStorage';

export interface ActionItem {
  id: string; // Action item ID
  profileId: string; // Associated profile ID
  biomarkerKey: string; // Associated biomarker key (e.g. 'ALT', 'CHOL', 'LIFESTYLE')
  title: string; // Title of the action
  completed: boolean; // Weekly completed state (stored in localStorage)
  categoryLabel: string; // Category label (e.g. '飲食', '生活', '運動')
  category?: string; // Raw category code (e.g. 'DIET')
  description?: string; // Optional description
  createdAt?: string; // Creation timestamp
}

export type ActionStorageMap = {
  [profileId: string]: {
    [biomarkerKey: string]: {
      [actionId: string]: Omit<ActionItem, 'completed'>;
    };
  };
};

const SAVED_ACTIONS_STORAGE_KEY = 'healsight_actions';

// Default starter actions for profiles
const getDefaultProfileActions = (profileId: string): ActionStorageMap[string] => ({
  'LIFESTYLE': {
    'act_01': {
      id: 'act_01',
      profileId,
      biomarkerKey: 'LIFESTYLE',
      title: '手搖飲本週改為無糖或微糖',
      categoryLabel: '飲食',
      category: 'DIET'
    },
    'act_02': {
      id: 'act_02',
      profileId,
      biomarkerKey: 'LIFESTYLE',
      title: '每日增加 500cc 溫開水攝取',
      categoryLabel: '生活',
      category: 'LIFESTYLE'
    }
  }
});

/**
 * Load saved action definitions.
 */
export const loadAllActionsMap = (): ActionStorageMap => {
  try {
    const raw = localStorage.getItem(SAVED_ACTIONS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      const migrated: ActionStorageMap = {
        'prof_alex': {
          'LIFESTYLE': {}
        }
      };
      parsed.forEach((item: any) => {
        const id = item.id || `act_${Date.now()}`;
        const marker = item.biomarkerKey || 'LIFESTYLE';
        if (!migrated['prof_alex'][marker]) {
          migrated['prof_alex'][marker] = {};
        }
        migrated['prof_alex'][marker][id] = {
          id,
          profileId: 'prof_alex',
          biomarkerKey: marker,
          title: item.title || '',
          categoryLabel: item.categoryLabel || '生活',
          category: item.category || 'LIFESTYLE'
        };
      });
      localStorage.setItem(SAVED_ACTIONS_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return parsed as ActionStorageMap;
  } catch (err) {
    console.error('Failed to load saved actions map:', err);
    return {};
  }
};

/**
 * Save action definitions.
 */
export const saveAllActionsMap = (map: ActionStorageMap): void => {
  try {
    localStorage.setItem(SAVED_ACTIONS_STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save actions map:', err);
  }
};

/**
 * Get all action items for a given profile, dynamically merged with weekly completion status.
 */
export const getProfileActions = (profileId: string, biomarkerKey?: string): ActionItem[] => {
  const map = loadAllActionsMap();

  if (!map[profileId]) {
    map[profileId] = getDefaultProfileActions(profileId);
    saveAllActionsMap(map);
  }

  const profileBucket = map[profileId] || {};

  const mapItemToAction = (rawItem: Omit<ActionItem, 'completed'>): ActionItem => ({
    ...rawItem,
    completed: getWeeklyActionCompletion(profileId, rawItem.id)
  });

  if (biomarkerKey) {
    const markerBucket = profileBucket[biomarkerKey] || {};
    return Object.values(markerBucket).map(mapItemToAction);
  }

  const allActions: ActionItem[] = [];
  Object.values(profileBucket).forEach(markerGroup => {
    Object.values(markerGroup).forEach(rawAction => {
      allActions.push(mapItemToAction(rawAction));
    });
  });

  return allActions;
};

/**
 * Add or commit an action item under (profileId, biomarkerKey, actionId).
 */
export const commitActionItem = (
  profileId: string,
  biomarkerKey: string,
  action: { id: string; title: string; categoryLabel: string; category?: string; description?: string }
): void => {
  const map = loadAllActionsMap();

  if (!map[profileId]) {
    map[profileId] = getDefaultProfileActions(profileId);
  }
  if (!map[profileId][biomarkerKey]) {
    map[profileId][biomarkerKey] = {};
  }

  map[profileId][biomarkerKey][action.id] = {
    id: action.id,
    profileId,
    biomarkerKey,
    title: action.title,
    categoryLabel: action.categoryLabel,
    category: action.category,
    description: action.description,
    createdAt: new Date().toISOString()
  };

  saveAllActionsMap(map);
};

/**
 * Remove an action item from (profileId, biomarkerKey, actionId).
 */
export const removeActionItem = (profileId: string, biomarkerKey: string, actionId: string): void => {
  const map = loadAllActionsMap();
  if (map[profileId]?.[biomarkerKey]?.[actionId]) {
    delete map[profileId][biomarkerKey][actionId];
    saveAllActionsMap(map);
  }
};

/**
 * Check whether an action item is committed for (profileId, biomarkerKey, actionId).
 */
export const isActionCommitted = (profileId: string, biomarkerKey: string, actionId: string): boolean => {
  const map = loadAllActionsMap();
  return !!map[profileId]?.[biomarkerKey]?.[actionId];
};

/**
 * Toggle weekly completed state for an action under (profileId, biomarkerKey, actionId).
 * Persisted in browser localStorage under 'healsight_weekly_action_completions'.
 */
export const toggleActionCompleted = (profileId: string, _biomarkerKey: string, actionId: string): boolean => {
  return toggleWeeklyActionCompletion(profileId, actionId);
};
