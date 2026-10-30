import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const DATA_KEY_PREFIX = 'garden-schedule:data:';
const MIGRATION_KEY = 'garden-schedule:localstorage-migrated-v1';
let androidWriteQueue: Promise<void> = Promise.resolve();
let androidWriteError: unknown = null;
let storageMirrorInstalled = false;

const queueAndroidWrite = (write: () => Promise<void>) => {
  androidWriteQueue = androidWriteQueue.then(write).catch(error => {
    androidWriteError = error;
    console.error('Android garden data could not be saved to native storage.', error);
  });
};

// Move existing garden keys to Android storage before React reads them, then mirror future writes.
export const initializeAndroidDataStore = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'android') return;

  const initialKeys = (await Preferences.keys()).keys;
  if (!initialKeys.includes(MIGRATION_KEY)) {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith('garden-')) continue;
      const nativeKey = `${DATA_KEY_PREFIX}${key}`;
      const stored = await Preferences.get({ key: nativeKey });
      if (stored.value === null) {
        const value = localStorage.getItem(key);
        if (value !== null) await Preferences.set({ key: nativeKey, value });
      }
    }
    await Preferences.set({ key: MIGRATION_KEY, value: 'complete' });
  }

  const savedKeys = (await Preferences.keys()).keys;
  for (const nativeKey of savedKeys.filter(key => key.startsWith(DATA_KEY_PREFIX))) {
    const stored = await Preferences.get({ key: nativeKey });
    if (stored.value !== null) localStorage.setItem(nativeKey.slice(DATA_KEY_PREFIX.length), stored.value);
  }

  if (storageMirrorInstalled) return;
  storageMirrorInstalled = true;
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (key: string, value: string) {
    originalSetItem.call(this, key, value);
    if (this === window.localStorage && key.startsWith('garden-')) {
      const nativeKey = `${DATA_KEY_PREFIX}${key}`;
      const savedValue = String(value);
      queueAndroidWrite(() => Preferences.set({ key: nativeKey, value: savedValue }));
    }
  };
  Storage.prototype.removeItem = function (key: string) {
    originalRemoveItem.call(this, key);
    if (this === window.localStorage && key.startsWith('garden-')) {
      queueAndroidWrite(() => Preferences.remove({ key: `${DATA_KEY_PREFIX}${key}` }));
    }
  };
};

// Wait for queued native writes before creating a portable backup.
export const flushAndroidDataStore = async (): Promise<void> => {
  await androidWriteQueue;
  if (androidWriteError !== null) {
    const error = androidWriteError;
    androidWriteError = null;
    throw error;
  }
};
