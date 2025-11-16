const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  triggerKey: (key) => ipcRenderer.invoke('shout-keypress', key)
});
