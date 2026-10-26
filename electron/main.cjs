const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

const FORMAT_VERSION = 1;
let mainWindow;

const emptyGardenData = () => ({ formatVersion: FORMAT_VERSION, plants: [] });

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
  if (!value || value.formatVersion !== FORMAT_VERSION || !Array.isArray(value.plants)) {
    throw new Error('This is not a supported Garden Schedule data file.');
  }

  const plants = value.plants.map(plant => {
    if (!plant || typeof plant.id !== 'string' || typeof plant.name !== 'string') {
      throw new Error('A plant record is missing its id or name.');
    }
    return {
      ...plant,
      source: plant.source === 'custom' ? 'custom' : 'built-in',
    };
  });

  return { ...value, formatVersion: FORMAT_VERSION, plants };
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
  const updatedRecord = {
    ...(index >= 0 ? data.plants[index] : {}),
    id: plant.id,
    name: plant.name,
    source: 'built-in',
    setup: plant.setup,
  };
  if (index >= 0) data.plants[index] = updatedRecord;
  else data.plants.push(updatedRecord);
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
  return writeGardenData({
    formatVersion: FORMAT_VERSION,
    plants: Array.from(recordsById.values()),
  });
}

function registerHandlers() {
  ipcMain.handle('garden-data:load', () => readGardenData());
  ipcMain.handle('garden-data:save-setup', (_event, plant) => savePlantSetup(plant));
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
