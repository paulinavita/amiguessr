const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadAppData: () => ipcRenderer.invoke('appData:load'),
  saveAppData: (payload) => ipcRenderer.invoke('appData:save', payload),
  clearAppData: () => ipcRenderer.invoke('appData:clear'),
  saveImageFromDataUrl: (payload) => ipcRenderer.invoke('image:saveFromDataUrl', payload),
  openJsonDialog: () => ipcRenderer.invoke('dialog:openJson'),
  saveJsonDialog: (jsonText) => ipcRenderer.invoke('dialog:saveJson', jsonText),
});
