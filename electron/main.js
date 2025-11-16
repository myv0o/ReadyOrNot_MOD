const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execFile } = require('child_process');

function sendKeyWithPowerShell(key) {
  const script = `
$wshell = New-Object -ComObject wscript.shell
Start-Sleep -Milliseconds 50
$wshell.SendKeys('${key}')
`;

  execFile(
    'powershell.exe',
    ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', script],
    (err) => {
      if (err) {
        console.error("Failed to send key via PowerShell:", err);
      }
    }
  );
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    backgroundColor: '#050509',
    autoHideMenuBar: true,
    title: 'LOUDER !!!!!! ',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

ipcMain.handle('shout-keypress', (event, key) => {
  sendKeyWithPowerShell(key);
});

app.whenReady().then(createWindow);
