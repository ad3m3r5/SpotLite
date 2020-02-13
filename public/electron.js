const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV == "dev" ? true : false;

// get parameters from callback url
function getParams(url) {
    let params = {};
    url.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function(m,key,value) {
        params[key] = value;
    });
    return params;
}

let mainWindow;
let authWindow;

// Create main app window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 325,
        useContentSize: true,
        title: 'SpotLite',
        frame: false,
        fullscreen: false,
        fullscreenable: false,
        maximizable: false,
        movable: true,
        resizable: false,
        titleBarStyle: 'hidden',
        autoHideMenuBar: true,
        backgroundColor: '#282828',
        show: true,
        webPreferences: {
            nodeIntegration: true,
            nativeWindowOpen: true,
            devTools: false,
            plugins: true,
        },
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`,
    );

    if (isDev) {
        mainWindow.webContents.openDevTools();
        authWindow.webPreferences.devTools(true);
    }

    mainWindow.on('closed', () => {
        mainWindow = null
    });
}

// Create auth window popup
function createPopup(event, url) {
    authWindow = new BrowserWindow({
        width: 400,
        height: 650,
        useContentSize: true,
        title: 'spotify-login',
        alwaysOnTop: true,
        fullscreen: false,
        fullscreenable: false,
        maximizable: false,
        movable: true,
        resizable: false,
        autoHideMenuBar: true,
        backgroundColor: '#282828',
        webPreferences: {
            nodeIntegration: false,
            enableRemoteModule: true,
            devTools: false,
        }
    })

    authWindow.loadURL(url)

    if (isDev) {
        authWindow.webContents.openDevTools();
        authWindow.webPreferences.devTools(true);
    }

    authWindow.on('closed', function() {
        authWindow = null;
    })

    authWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
        const { url } = details;
        var params = getParams(url)

        if (params.code) {
            authWindow.removeAllListeners('closed');
            setImmediate(() => {
                authWindow.close();
            })
            event.reply('spotify-oauth-reply', {code: params.code})
        } else if (params.error) {
            authWindow.removeAllListeners('closed');
            setImmediate(() => {
                authWindow.close();
            });
            event.reply('spotify-oauth-reply', {error: params.error})
        } else {
            callback({
                cancel: false
            })
        }
    })
}


app.on('ready', () => {
    // App is Ready
});

// When widevineCDM is ready
app.on('widevine-ready', (version, lastVersion) => {
    createWindow();

    if (null !== lastVersion) {
        console.log('Widevine ' + version + ', upgraded from ' + lastVersion + ', is ready to be used!');
    } else {
        console.log('Widevine ' + version + ' is ready to be used!');
    }
});
app.on('widevine-update-pending', (currentVersion, pendingVersion) => {
	console.log('Widevine ' + currentVersion + ' is ready to be upgraded to ' + pendingVersion + '!');
});
app.on('widevine-error', (error) => {
	console.log('Widevine installation encountered an error: ' + error);
	process.exit(1)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// On login open
ipcMain.on('spotify-oauth', (event, arg) => {
    if (arg.queryURL) {
        createPopup(event, arg.queryURL)
    }
})