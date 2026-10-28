const DATABASE_NAME = 'garden-schedule-photos';
const STORE_NAME = 'plant-photos';

const openPhotoDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Plant photo storage is unavailable.'));
});

// Use IndexedDB so photo storage can grow beyond localStorage's small quota.
export const loadPlantPhotos = async (): Promise<Record<string, string>> => {
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

export const savePlantPhoto = async (plantId: string, photo: string): Promise<void> => {
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
