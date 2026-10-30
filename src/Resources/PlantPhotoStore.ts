import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

const DATABASE_NAME = 'garden-schedule-photos';
const STORE_NAME = 'plant-photos';
const ANDROID_PHOTO_DIRECTORY = 'garden-plant-photos';

const openPhotoDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Plant photo storage is unavailable.'));
});

// Keep browser photos out of localStorage so they do not consume its small quota.
const loadIndexedDbPhotos = async (): Promise<Record<string, string>> => {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).openCursor();
    const photos: Record<string, string> = {};
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) { database.close(); resolve(photos); return; }
      if (typeof cursor.key === 'string' && typeof cursor.value === 'string') photos[cursor.key] = cursor.value;
      cursor.continue();
    };
    request.onerror = () => { database.close(); reject(request.error ?? new Error('Plant photos could not be loaded.')); };
  });
};

const androidPhotoFile = (plantId: string) => `${ANDROID_PHOTO_DIRECTORY}/${encodeURIComponent(plantId)}.txt`;

// Store Android photo data privately so WebView storage eviction cannot remove plant images.
const ensureAndroidPhotoDirectory = async (): Promise<void> => {
  const directory = { path: ANDROID_PHOTO_DIRECTORY, directory: Directory.Data };
  try {
    await Filesystem.readdir(directory);
  } catch {
    try {
      await Filesystem.mkdir({ ...directory, recursive: true });
    } catch (error) {
      // Another load or upload may have created the folder after the initial check.
      try { await Filesystem.readdir(directory); }
      catch { throw error; }
    }
  }
};

const loadAndroidPhotos = async (): Promise<Record<string, string>> => {
  await ensureAndroidPhotoDirectory();
  const { files } = await Filesystem.readdir({ path: ANDROID_PHOTO_DIRECTORY, directory: Directory.Data });
  const photos: Record<string, string> = {};
  for (const file of files) {
    if (!file.name.endsWith('.txt')) continue;
    const plantId = decodeURIComponent(file.name.slice(0, -4));
    const saved = await Filesystem.readFile({
      path: `${ANDROID_PHOTO_DIRECTORY}/${file.name}`, directory: Directory.Data, encoding: Encoding.UTF8,
    });
    if (typeof saved.data === 'string') photos[plantId] = saved.data;
  }
  return photos;
};

const saveAndroidPhoto = async (plantId: string, photo: string): Promise<void> => {
  await ensureAndroidPhotoDirectory();
  await Filesystem.writeFile({
    path: androidPhotoFile(plantId), data: photo, directory: Directory.Data, encoding: Encoding.UTF8,
  });
};

const removeIndexedDbPhotos = async (plantIds: string[]): Promise<void> => {
  if (!plantIds.length) return;
  const database = await openPhotoDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    plantIds.forEach(plantId => store.delete(plantId));
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error('Plant photos could not be removed.')); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error('Plant photos could not be removed.')); };
  });
};

export const loadPlantPhotos = async (): Promise<Record<string, string>> => {
  if (Capacitor.getPlatform() !== 'android') return loadIndexedDbPhotos();

  // Migrate old Android WebView photos only after their app-private copies have been written.
  const [androidPhotos, legacyPhotos] = await Promise.all([loadAndroidPhotos(), loadIndexedDbPhotos()]);
  const legacyIds = Object.keys(legacyPhotos).filter(plantId => !androidPhotos[plantId]);
  for (const plantId of legacyIds) await saveAndroidPhoto(plantId, legacyPhotos[plantId]);
  await removeIndexedDbPhotos(Object.keys(legacyPhotos));
  return { ...legacyPhotos, ...androidPhotos };
};

export const savePlantPhoto = async (plantId: string, photo: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'android') {
    await saveAndroidPhoto(plantId, photo);
    await removeIndexedDbPhotos([plantId]);
    return;
  }
  const database = await openPhotoDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(photo, plantId);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error('Plant photo could not be saved.')); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error('Plant photo could not be saved.')); };
  });
};

export const removePlantPhotos = async (plantIds: string[]): Promise<void> => {
  if (!plantIds.length) return;
  if (Capacitor.getPlatform() === 'android') {
    const { files } = await Filesystem.readdir({ path: ANDROID_PHOTO_DIRECTORY, directory: Directory.Data }).catch(() => ({ files: [] }));
    const savedFiles = new Set(files.map(file => file.name));
    await Promise.all(plantIds.map(plantId => {
      const path = androidPhotoFile(plantId);
      const fileName = path.slice(path.lastIndexOf('/') + 1);
      return savedFiles.has(fileName) ? Filesystem.deleteFile({ path, directory: Directory.Data }) : Promise.resolve();
    }));
    await removeIndexedDbPhotos(plantIds);
    return;
  }
  const database = await openPhotoDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    plantIds.forEach(plantId => store.delete(plantId));
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error ?? new Error('Plant photos could not be removed.')); };
    transaction.onabort = () => { database.close(); reject(transaction.error ?? new Error('Plant photos could not be removed.')); };
  });
};
