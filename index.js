const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');

let win;
let winConfig = {
    width: 375,
    height: 667
};

let creatWin = function(){

    win = new BrowserWindow(winConfig);

    /--debug/.test(process.argv[2]) && win.webContents.openDevTools();

    win.loadURL('file://' + path.join(__dirname, 'app/index.html'));

    win.on('closed', ()=>{
        win = null;
    });

};

app.on('ready', creatWin);



app.on('window-all-closed', ()=>{
    app.quit();    
});

app.on('activate', function () {
    if (win === null) {
        creatWin();
    }
});

