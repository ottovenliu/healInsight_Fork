/**
 * Storage Migration & Version Control Utility
 *
 * Provides schema version management and sequential migration for browser localStorage.
 * Rule: If no version is found in localStorage, localStorage is cleared completely,
 * and initialized to the latest version.
 */

export const STORAGE_VERSION_KEY = 'healsight_storage_version';
export const CURRENT_STORAGE_VERSION = 1;

export interface StorageMigration {
  version: number;
  description: string;
  migrate: (storage: Storage) => void;
}

export type MigrationAction = 'cleared_and_initialized' | 'migrated' | 'no_action_needed';

export interface MigrationResult {
  action: MigrationAction;
  previousVersion: number | null;
  currentVersion: number;
  appliedMigrations: number[];
}

/**
 * Migration registry array.
 * Migrations must be ordered by version ascending.
 */
const registry: StorageMigration[] = [
  // Future migrations can be placed here, for example:
  // {
  //   version: 2,
  //   description: 'Migrate profile format or action item structure',
  //   migrate: (storage) => { ... }
  // }
];

/**
 * Register an additional migration (useful for feature extensions or tests).
 */
export const registerMigration = (migration: StorageMigration): void => {
  const existingIndex = registry.findIndex(m => m.version === migration.version);
  if (existingIndex >= 0) {
    registry[existingIndex] = migration;
  } else {
    registry.push(migration);
    registry.sort((a, b) => a.version - b.version);
  }
};

/**
 * Get all registered migrations.
 */
export const getRegisteredMigrations = (): readonly StorageMigration[] => {
  return [...registry];
};

/**
 * Helper to resolve the active Storage instance (defaults to window.localStorage).
 */
export const getStorageInstance = (customStorage?: Storage): Storage | null => {
  if (customStorage) return customStorage;
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage?: Storage }).localStorage!;
  }
  return null;
};

/**
 * Read the current schema version from storage.
 * Returns null if the version key is missing, empty, or not a valid integer.
 */
export const getStorageVersion = (customStorage?: Storage): number | null => {
  const storage = getStorageInstance(customStorage);
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_VERSION_KEY);
    if (raw === null || raw.trim() === '') return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
  } catch (err) {
    console.error('[StorageMigration] Error reading storage version:', err);
    return null;
  }
};

/**
 * Write the schema version to storage.
 */
export const setStorageVersion = (version: number, customStorage?: Storage): void => {
  const storage = getStorageInstance(customStorage);
  if (!storage) return;

  try {
    storage.setItem(STORAGE_VERSION_KEY, String(version));
  } catch (err) {
    console.error('[StorageMigration] Error setting storage version:', err);
  }
};

/**
 * Completely clear localStorage and initialize with the target schema version.
 */
export const clearAndInitializeStorage = (
  targetVersion: number = CURRENT_STORAGE_VERSION,
  customStorage?: Storage
): void => {
  const storage = getStorageInstance(customStorage);
  if (!storage) return;

  try {
    storage.clear();
    setStorageVersion(targetVersion, storage);
    console.info(`[StorageMigration] localStorage cleared and initialized to v${targetVersion}.`);
  } catch (err) {
    console.error('[StorageMigration] Error clearing and initializing storage:', err);
  }
};

/**
 * Run version check and sequential migrations.
 *
 * Rules:
 * 1. If storedVersion is null or invalid (no version exists):
 *    -> localStorage is completely cleared.
 *    -> Version is set to targetVersion (defaults to CURRENT_STORAGE_VERSION).
 * 2. If storedVersion < targetVersion:
 *    -> Sequential migrations (storedVersion < v <= targetVersion) are executed in order.
 *    -> Version is updated to targetVersion.
 * 3. If storedVersion === targetVersion:
 *    -> No action needed.
 * 4. If storedVersion > targetVersion:
 *    -> Storage is from a newer version of the app. A warning is logged, no data cleared.
 */
export const runStorageMigrations = (
  customStorage?: Storage,
  targetVersion: number = CURRENT_STORAGE_VERSION
): MigrationResult => {
  const storage = getStorageInstance(customStorage);
  if (!storage) {
    return {
      action: 'no_action_needed',
      previousVersion: null,
      currentVersion: targetVersion,
      appliedMigrations: []
    };
  }

  const storedVersion = getStorageVersion(storage);

  // 1. No version or invalid -> Clear localStorage and initialize
  if (storedVersion === null) {
    console.warn(
      `[StorageMigration] No version found in localStorage. Clearing all data and initializing schema to v${targetVersion}.`
    );
    clearAndInitializeStorage(targetVersion, storage);
    return {
      action: 'cleared_and_initialized',
      previousVersion: null,
      currentVersion: targetVersion,
      appliedMigrations: []
    };
  }

  // 2. Needs migration to newer version
  if (storedVersion < targetVersion) {
    console.info(`[StorageMigration] Upgrading storage schema from v${storedVersion} to v${targetVersion}...`);
    const applied: number[] = [];
    const sorted = [...registry].sort((a, b) => a.version - b.version);

    for (const step of sorted) {
      if (step.version > storedVersion && step.version <= targetVersion) {
        console.info(`[StorageMigration] Running migration v${step.version}: ${step.description}`);
        try {
          step.migrate(storage);
          applied.push(step.version);
          // Persist incremental version progression
          setStorageVersion(step.version, storage);
        } catch (stepErr) {
          console.error(`[StorageMigration] Failed at migration v${step.version}:`, stepErr);
          throw stepErr;
        }
      }
    }

    setStorageVersion(targetVersion, storage);
    console.info(`[StorageMigration] Schema successfully migrated to v${targetVersion}.`);

    return {
      action: 'migrated',
      previousVersion: storedVersion,
      currentVersion: targetVersion,
      appliedMigrations: applied
    };
  }

  // 3. Stored version is newer than current app version
  if (storedVersion > targetVersion) {
    console.warn(
      `[StorageMigration] Stored version (v${storedVersion}) is newer than application schema version (v${targetVersion}).`
    );
  }

  // 4. Up-to-date
  return {
    action: 'no_action_needed',
    previousVersion: storedVersion,
    currentVersion: storedVersion,
    appliedMigrations: []
  };
};
