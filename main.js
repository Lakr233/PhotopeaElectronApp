const { app, BrowserWindow, session, nativeImage } = require("electron");
const path = require("path");

const iconPath = path.join(__dirname, "ress/icon.png");
const appIcon = nativeImage.createFromPath(iconPath);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 888,
    height: 666,
    icon: appIcon,
    backgroundColor: "#000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  
  mainWindow.loadFile("PhotopeaBundle/index.html");
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(appIcon);
  }
  
  session.defaultSession.webRequest.onBeforeRequest({ urls: ["*://*/*"] }, (details, callback) => {
    console.log("Blocked request:", details.url);
    callback({ cancel: true });
  });

  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
