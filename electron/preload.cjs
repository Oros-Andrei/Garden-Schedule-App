const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gardenDesktop', {
  load: () => ipcRenderer.invoke('garden-data:load'),
  saveSetup: plant => ipcRenderer.invoke('garden-data:save-setup', plant),
  importData: () => ipcRenderer.invoke('garden-data:import'),
  openDataFolder: () => ipcRenderer.invoke('garden-data:open-folder'),
});
