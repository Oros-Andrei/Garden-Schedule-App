const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const FORMAT_VERSION = 1;
const MAX_PLANT_PHOTO_BYTES = 300 * 1024;
// Keep desktop event validation aligned with the renderer's built-in fertilizer choices.
const BUILT_IN_FERTILIZERS = ['Cucumber water', 'Normal', 'Banana Water'];
let mainWindow;

// Validate compressed image data at the desktop persistence boundary.
function validatePlantPhoto(photo) {
  const match = /^data:image\/(?:webp|jpeg|png);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo);
  if (!match) throw new Error('The plant photo format is invalid.');
  const padding = match[1].endsWith('==') ? 2 : match[1].endsWith('=') ? 1 : 0;
  const size = Math.floor(match[1].length * 3 / 4) - padding;
  if (size > MAX_PLANT_PHOTO_BYTES) throw new Error('The compressed plant photo exceeds 300 KB.');
}

const emptyGardenData = () => ({
  formatVersion: FORMAT_VERSION,
  categories: [],
  customOptions: { fertilizers: [], potMaterials: [], soils: [] },
  plants: [],
  deletedPlantIds: [],
  deletedCategoryIds: [],
});

// Normalize option lists centrally so imported backups and Settings writes use the same rules.
function normalizeCustomOptions(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('The custom options are invalid.');
  const result = {};
  for (const key of ['fertilizers', 'potMaterials', 'soils']) {
    if (value[key] !== undefined && !Array.isArray(value[key])) throw new Error(`The ${key} options are invalid.`);
    const options = value[key] || [];
    if (options.some(option => typeof option !== 'string' || !option.trim())) throw new Error(`The ${key} options are invalid.`);
    result[key] = Array.from(new Set(options.map(option => option.trim())));
  }
  return result;
}

function getGardenDataDirectory() {
  const portableDirectory = process.env.PORTABLE_EXECUTABLE_DIR;
  const executableDirectory = app.isPackaged ? path.dirname(app.getPath('exe')) : null;
  const rootDirectory = portableDirectory || executableDirectory || app.getPath('userData');
  return path.join(rootDirectory, 'GardenData');
}

function getGardenDataPath() {
  return path.join(getGardenDataDirectory(), 'garden-data.json');
}

function normalizeGardenData(value) {
  if (!value || value.formatVersion !== FORMAT_VERSION || !Array.isArray(value.plants) ||
      (value.categories !== undefined && !Array.isArray(value.categories)) ||
      (value.customOptions !== undefined && (!value.customOptions || typeof value.customOptions !== 'object' || Array.isArray(value.customOptions))) ||
      (value.deletedPlantIds !== undefined && !Array.isArray(value.deletedPlantIds)) ||
      (value.deletedCategoryIds !== undefined && !Array.isArray(value.deletedCategoryIds))) {
    throw new Error('This is not a supported Garden Schedule data file.');
  }

  // Default missing categories so earlier version 1 backups remain readable.
  const categories = (value.categories || []).map(category => {
    if (!category || typeof category.id !== 'string' || !category.id.trim() || typeof category.name !== 'string' || !category.name.trim()) {
      throw new Error('A category record is missing its id or name.');
    }
    return { ...category, id: category.id.trim(), name: category.name.trim() };
  });
  const customOptions = normalizeCustomOptions(value.customOptions);
  // Retain removed catalog IDs because built-in entries remain in application constants.
  const deletedPlantIds = Array.from(new Set((value.deletedPlantIds || []).map(id => {
    if (typeof id !== 'string' || !id.trim()) throw new Error('A deleted plant ID is invalid.');
    return id.trim();
  })));
  const deletedCategoryIds = Array.from(new Set((value.deletedCategoryIds || []).map(id => {
    if (typeof id !== 'string' || !id.trim()) throw new Error('A deleted category ID is invalid.');
    return id.trim();
  })));
  const plants = value.plants.map(plant => {
    if (!plant || typeof plant.id !== 'string' || typeof plant.name !== 'string') {
      throw new Error('A plant record is missing its id or name.');
    }
    if (plant.photo !== undefined && plant.photo !== null) validatePlantPhoto(plant.photo);
    return {
      ...plant,
      source: plant.source === 'custom' ? 'custom' : 'built-in',
    };
  });

  return {
    ...value,
    formatVersion: FORMAT_VERSION,
    categories: categories.filter(category => !deletedCategoryIds.includes(category.id)),
    customOptions,
    plants: plants.filter(plant => !deletedPlantIds.includes(plant.id) && !deletedCategoryIds.includes(plant.categoryId)),
    deletedPlantIds,
    deletedCategoryIds,
  };
}

// Save a compressed photo for either a built-in or user-created plant.
async function savePlantPhoto(plant) {
  if (!plant || typeof plant.id !== 'string' || !plant.id.trim() || typeof plant.name !== 'string' ||
      !plant.name.trim() || !['built-in', 'custom'].includes(plant.source)) {
    throw new Error('The plant photo details are invalid.');
  }
  validatePlantPhoto(plant.photo);
  const data = await readGardenData();
  const index = data.plants.findIndex(item => item.id === plant.id);
  const existing = index >= 0 ? data.plants[index] : {};
  const record = { ...existing, id: plant.id, name: plant.name, source: existing.source || plant.source, photo: plant.photo };
  if (index >= 0) data.plants[index] = record;
  else data.plants.push(record);
  return writeGardenData(data);
}

async function readGardenData() {
  await fs.mkdir(getGardenDataDirectory(), { recursive: true });
  try {
    const content = await fs.readFile(getGardenDataPath(), 'utf8');
    return normalizeGardenData(JSON.parse(content));
  } catch (error) {
    if (error.code === 'ENOENT') {
      const data = emptyGardenData();
      await writeGardenData(data);
      return data;
    }
    throw error;
  }
}

async function writeGardenData(data) {
  const normalized = normalizeGardenData(data);
  const directory = getGardenDataDirectory();
  await fs.mkdir(path.join(directory, 'photos'), { recursive: true });
  await fs.mkdir(path.join(directory, 'icons'), { recursive: true });
  const filePath = getGardenDataPath();
  const temporaryPath = `${filePath}.tmp`;
  await fs.writeFile(temporaryPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  await fs.rename(temporaryPath, filePath);
  return normalized;
}

async function savePlantSetup(plant) {
  if (!plant || typeof plant.id !== 'string' || typeof plant.name !== 'string' || !plant.setup) {
    throw new Error('The plant setup is invalid.');
  }
  const data = await readGardenData();
  const index = data.plants.findIndex(item => item.id === plant.id);
  const existingRecord = index >= 0 ? data.plants[index] : {};
  const careEvents = (Array.isArray(existingRecord.careEvents) ? existingRecord.careEvents : [])
    .filter(event => event.type !== 'potted' && event.type !== 'repotted');
  if (plant.setup.pottedOn) careEvents.push({
    id: `potted-${plant.setup.pottedOn}`,
    type: 'potted',
    date: plant.setup.pottedOn,
    potMaterial: plant.setup.potMaterial,
    substrate: plant.setup.substrate,
  });
  if (plant.setup.repotted) careEvents.push({
    id: `repotted-${plant.setup.repotted}`,
    type: 'repotted',
    date: plant.setup.repotted,
    potMaterial: plant.setup.potMaterial,
    substrate: plant.setup.substrate,
  });
  const updatedRecord = {
    ...existingRecord,
    id: plant.id,
    name: plant.name,
    // Setup edits must not turn a custom plant into a built-in record.
    source: existingRecord.source === 'custom' ? 'custom' : 'built-in',
    setup: plant.setup,
    careEvents,
  };
  if (index >= 0) data.plants[index] = updatedRecord;
  else data.plants.push(updatedRecord);
  return writeGardenData(data);
}

// Persist categories separately so empty custom categories survive restarts and backups.
async function saveCustomCategory(category) {
  if (!category || typeof category.id !== 'string' || !category.id.trim() || typeof category.name !== 'string' || !category.name.trim()) {
    throw new Error('The category name is required.');
  }
  const data = await readGardenData();
  const record = { id: category.id.trim(), name: category.name.trim() };
  const index = data.categories.findIndex(item => item.id === record.id);
  if (index >= 0) data.categories[index] = record;
  else data.categories.push(record);
  return writeGardenData(data);
}

// Validate every editable guidance section before it enters the garden data file.
function validatePlantProfileContent(plant) {
  // Validate each optional guidance section before accepting it from the renderer.
  if (plant.details !== undefined) {
    const details = plant.details;
    if (!details || typeof details !== 'object' || !details.watering ||
        typeof details.watering.summer !== 'string' || typeof details.watering.winter !== 'string' ||
        !Number.isFinite(details.watering.summerMl) || details.watering.summerMl < 0 ||
        !Number.isFinite(details.watering.winterMl) || details.watering.winterMl < 0 ||
        typeof details.light !== 'string' || typeof details.temp !== 'string' ||
        (details.warning !== undefined && typeof details.warning !== 'string') ||
        !Array.isArray(details.tips) || details.tips.some(tip => typeof tip !== 'string')) {
      throw new Error('The plant care information is invalid.');
    }
  }
  if (plant.fertilizer !== undefined) {
    const fertilizer = plant.fertilizer;
    if (!fertilizer || typeof fertilizer !== 'object' ||
        ['type', 'schedule', 'npkLabel', 'method', 'avoid'].some(key => typeof fertilizer[key] !== 'string') ||
        !fertilizer.npk || ['n', 'p', 'k'].some(key => !Number.isFinite(fertilizer.npk[key]) || fertilizer.npk[key] < 0) ||
        !Array.isArray(fertilizer.extras) || fertilizer.extras.some(extra => typeof extra !== 'string')) {
      throw new Error('The plant fertilizer information is invalid.');
    }
  }
  if (plant.tricks !== undefined && (!Array.isArray(plant.tricks) || plant.tricks.some(trick =>
    !trick || typeof trick.icon !== 'string' || typeof trick.title !== 'string' || typeof trick.body !== 'string'))) {
    throw new Error('The plant tricks are invalid.');
  }
  if (plant.diseases !== undefined && (!Array.isArray(plant.diseases) || plant.diseases.some(disease =>
    !disease || typeof disease.symptom !== 'string' || !['high', 'medium', 'low'].includes(disease.severity) ||
    typeof disease.cause !== 'string' || typeof disease.fix !== 'string'))) {
    throw new Error('The plant disease information is invalid.');
  }
}

// Store user-entered identity and care guidance while preserving unrelated plant data.
async function saveCustomPlant(plant) {
  if (!plant || typeof plant.id !== 'string' || !plant.id.trim() || typeof plant.name !== 'string' || !plant.name.trim() ||
      typeof plant.latin !== 'string' || !plant.latin.trim() ||
      typeof plant.categoryId !== 'string' || !plant.categoryId.trim()) {
    throw new Error('The plant name, Latin name, and category are required.');
  }
  validatePlantProfileContent(plant);
  const data = await readGardenData();
  const record = { ...plant, id: plant.id.trim(), name: plant.name.trim(), latin: plant.latin.trim(), categoryId: plant.categoryId.trim(), source: 'custom' };
  const index = data.plants.findIndex(item => item.id === record.id);
  if (index >= 0) data.plants[index] = { ...data.plants[index], ...record };
  else data.plants.push(record);
  return writeGardenData(data);
}

// Save only the requested guidance section so built-in catalog identities remain fixed.
async function savePlantProfileContent(payload) {
  if (!payload || typeof payload.id !== 'string' || !payload.id.trim() || typeof payload.name !== 'string' ||
      !payload.name.trim() || !['built-in', 'custom'].includes(payload.source) || !payload.update ||
      !['care', 'fertilizer', 'tricks', 'diseases'].includes(payload.update.section)) {
    throw new Error('The plant profile update is invalid.');
  }
  const update = payload.update;
  const content = update.section === 'care' ? { details: update.details }
    : update.section === 'fertilizer' ? { fertilizer: update.fertilizer }
    : update.section === 'tricks' ? { tricks: update.tricks }
    : { diseases: update.diseases };
  if (Object.values(content)[0] === undefined) throw new Error('The plant profile section is missing its content.');
  validatePlantProfileContent(content);
  const data = await readGardenData();
  const index = data.plants.findIndex(item => item.id === payload.id.trim());
  const existing = index >= 0 ? data.plants[index] : {};
  if (existing.source && existing.source !== payload.source) throw new Error('The plant source does not match its saved record.');
  const record = { ...existing, ...content, id: payload.id.trim(), name: payload.name.trim(), source: payload.source };
  if (index >= 0) data.plants[index] = record;
  else data.plants.push(record);
  return writeGardenData(data);
}

// Record plant removals so built-in catalog entries stay hidden after restart.
async function deletePlant(id) {
  if (typeof id !== 'string' || !id.trim()) throw new Error('The plant ID is required.');
  const data = await readGardenData();
  const plantId = id.trim();
  data.deletedPlantIds = Array.from(new Set([...data.deletedPlantIds, plantId]));
  data.plants = data.plants.filter(plant => plant.id !== plantId);
  return writeGardenData(data);
}

// Persist category and plant tombstones together to keep deleted defaults removed.
async function deleteCategory(payload) {
  const { id, plantIds } = payload || {};
  if (typeof id !== 'string' || !id.trim() || !Array.isArray(plantIds) || plantIds.some(plantId => typeof plantId !== 'string' || !plantId.trim())) {
    throw new Error('The category deletion request is invalid.');
  }
  const data = await readGardenData();
  const categoryId = id.trim();
  const removedPlantIds = Array.from(new Set([
    ...plantIds.map(plantId => plantId.trim()),
    ...data.plants.filter(plant => plant.categoryId === categoryId).map(plant => plant.id),
  ]));
  data.deletedCategoryIds = Array.from(new Set([...data.deletedCategoryIds, categoryId]));
  data.deletedPlantIds = Array.from(new Set([...data.deletedPlantIds, ...removedPlantIds]));
  data.categories = data.categories.filter(category => category.id !== categoryId);
  const removedIds = new Set(removedPlantIds);
  data.plants = data.plants.filter(plant => !removedIds.has(plant.id) && plant.categoryId !== categoryId);
  return writeGardenData(data);
}

// Store only user additions so built-in choices remain managed by application code.
async function saveCustomOptions(options) {
  const additions = normalizeCustomOptions(options);
  const data = await readGardenData();
  data.customOptions = Object.fromEntries(Object.keys(additions).map(key => [
    key,
    Array.from(new Set([...data.customOptions[key], ...additions[key]])),
  ]));
  return writeGardenData(data);
}

async function saveCareEvent(payload) {
  const { id, name, event } = payload || {};
  if (typeof id !== 'string' || typeof name !== 'string' || !event ||
      !['watering', 'fertilizing', 'potted', 'repotted'].includes(event.type) || typeof event.date !== 'string') {
    throw new Error('The care event is invalid.');
  }
  if ((event.type === 'potted' || event.type === 'repotted') &&
      (typeof event.potMaterial !== 'string' || !event.potMaterial || typeof event.substrate !== 'string' || !event.substrate)) {
    throw new Error('The pot material and soil are required for potting events.');
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(event.date);
  if (!match) throw new Error('The care event date is invalid.');
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) {
    throw new Error('The care event date is invalid.');
  }

  const data = await readGardenData();
  // Accept configured fertilizer names while rejecting unconfigured event values.
  if (event.type === 'fertilizing' && ![...BUILT_IN_FERTILIZERS, ...data.customOptions.fertilizers].includes(event.fertilizerMethod)) {
    throw new Error('The fertilizer type is invalid.');
  }
  const index = data.plants.findIndex(plant => plant.id === id);
  const existing = index >= 0 ? data.plants[index] : { id, name, source: 'built-in' };
  const careEvents = (Array.isArray(existing.careEvents) ? existing.careEvents : [])
    .filter(item => !(item.type === event.type &&
      ((event.type === 'potted' || event.type === 'repotted') || item.date === event.date)));
  careEvents.push({ ...event, id: `${event.type}-${event.date}` });
  const setup = (event.type === 'potted' || event.type === 'repotted') ? {
    ...(existing.setup || {}),
    potMaterial: event.potMaterial,
    substrate: event.substrate,
    ...(event.type === 'potted' ? { pottedOn: event.date } : { repotted: event.date }),
  } : existing.setup;
  const updated = { ...existing, id, name, careEvents, ...(setup ? { setup } : {}) };
  if (index >= 0) data.plants[index] = updated;
  else data.plants.push(updated);
  return writeGardenData(data);
}

// Remove one care record and persist any matching setup-date change with it.
async function deleteCareEvent(payload) {
  const { id, name, source, eventId, type, date, setup } = payload || {};
  if (typeof id !== 'string' || !id.trim() || typeof name !== 'string' || !name.trim() ||
      !['built-in', 'custom'].includes(source) || typeof eventId !== 'string' || !eventId.trim() ||
      !['watering', 'fertilizing', 'potted', 'repotted'].includes(type) || typeof date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('The care-event deletion request is invalid.');
  }
  const data = await readGardenData();
  const index = data.plants.findIndex(plant => plant.id === id);
  const existing = index >= 0 ? data.plants[index] : { id, name, source };
  const careEvents = (Array.isArray(existing.careEvents) ? existing.careEvents : [])
    .filter(event => !(event.id === eventId && event.type === type));
  const updated = { ...existing, name, careEvents, ...(setup ? { setup } : {}) };
  if (index >= 0) data.plants[index] = updated;
  else data.plants.push(updated);
  return writeGardenData(data);
}

async function importGardenData() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import garden data',
    properties: ['openFile'],
    filters: [{ name: 'Garden data', extensions: ['json'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return null;

  const content = await fs.readFile(result.filePaths[0], 'utf8');
  const importedData = normalizeGardenData(JSON.parse(content));
  const currentData = await readGardenData();
  const recordsById = new Map(currentData.plants.map(plant => [plant.id, plant]));
  importedData.plants.forEach(plant => {
    recordsById.set(plant.id, { ...recordsById.get(plant.id), ...plant });
  });
  // Merge records and removal IDs so importing a backup does not revive deleted defaults.
  return writeGardenData({
    formatVersion: FORMAT_VERSION,
    categories: Array.from(new Map([...currentData.categories, ...importedData.categories].map(category => [category.id, category])).values()),
    customOptions: Object.fromEntries(['fertilizers', 'potMaterials', 'soils'].map(key => [
      key,
      Array.from(new Set([...currentData.customOptions[key], ...importedData.customOptions[key]])),
    ])),
    plants: Array.from(recordsById.values()),
    deletedPlantIds: Array.from(new Set([...currentData.deletedPlantIds, ...importedData.deletedPlantIds])),
    deletedCategoryIds: Array.from(new Set([...currentData.deletedCategoryIds, ...importedData.deletedCategoryIds])),
  });
}

function registerHandlers() {
  ipcMain.handle('garden-data:load', () => readGardenData());
  ipcMain.handle('garden-data:save-setup', (_event, plant) => savePlantSetup(plant));
  ipcMain.handle('garden-data:save-plant-photo', (_event, plant) => savePlantPhoto(plant));
  ipcMain.handle('garden-data:log-care-event', (_event, payload) => saveCareEvent(payload));
  ipcMain.handle('garden-data:delete-care-event', (_event, payload) => deleteCareEvent(payload));
  ipcMain.handle('garden-data:save-custom-category', (_event, category) => saveCustomCategory(category));
  ipcMain.handle('garden-data:save-custom-plant', (_event, plant) => saveCustomPlant(plant));
  ipcMain.handle('garden-data:save-profile-content', (_event, payload) => savePlantProfileContent(payload));
  ipcMain.handle('garden-data:delete-plant', (_event, id) => deletePlant(id));
  ipcMain.handle('garden-data:delete-category', (_event, payload) => deleteCategory(payload));
  ipcMain.handle('garden-data:save-custom-options', (_event, options) => saveCustomOptions(options));
  ipcMain.handle('garden-data:import', () => importGardenData());
  ipcMain.handle('garden-data:open-folder', async () => {
    await fs.mkdir(getGardenDataDirectory(), { recursive: true });
    return shell.openPath(getGardenDataDirectory());
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 360,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const devServerUrl = process.env.GARDEN_DEV_SERVER_URL;
  if (devServerUrl) mainWindow.loadURL(devServerUrl);
  else mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  registerHandlers();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
