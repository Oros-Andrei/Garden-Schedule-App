const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gardenDesktop', {
  load: () => ipcRenderer.invoke('garden-data:load'),
  saveSetup: plant => ipcRenderer.invoke('garden-data:save-setup', plant),
  logCareEvent: payload => ipcRenderer.invoke('garden-data:log-care-event', payload),
  importData: () => ipcRenderer.invoke('garden-data:import'),
  openDataFolder: () => ipcRenderer.invoke('garden-data:open-folder'),
});
