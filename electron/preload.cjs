const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gardenDesktop', {
  load: () => ipcRenderer.invoke('garden-data:load'),
  saveSetup: plant => ipcRenderer.invoke('garden-data:save-setup', plant),
  // Route photo writes through the validated garden-data handler.
  savePlantPhoto: plant => ipcRenderer.invoke('garden-data:save-plant-photo', plant),
  logCareEvent: payload => ipcRenderer.invoke('garden-data:log-care-event', payload),
  // Route care-event removal through the validated garden data writer.
  deleteCareEvent: payload => ipcRenderer.invoke('garden-data:delete-care-event', payload),
  // Keep custom record writes behind the validated main-process IPC handlers.
  saveCustomCategory: category => ipcRenderer.invoke('garden-data:save-custom-category', category),
  saveCustomPlant: plant => ipcRenderer.invoke('garden-data:save-custom-plant', plant),
  // Keep profile guidance writes behind main-process validation for either plant source.
  savePlantProfileContent: payload => ipcRenderer.invoke('garden-data:save-profile-content', payload),
  // Keep plant and category tombstones behind the main-process data validation boundary.
  deletePlant: id => ipcRenderer.invoke('garden-data:delete-plant', id),
  deleteCategory: payload => ipcRenderer.invoke('garden-data:delete-category', payload),
  // Route Settings additions through the main process so the data file stays validated.
  saveCustomOptions: options => ipcRenderer.invoke('garden-data:save-custom-options', options),
  importData: () => ipcRenderer.invoke('garden-data:import'),
  openDataFolder: () => ipcRenderer.invoke('garden-data:open-folder'),
});
