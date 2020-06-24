const electron = require("electron");
const { v4 : uuidv4 } = require('uuid');
uuidv4();
const {
    app, 
    BrowserWindow, 
    Menu, 
    ipcMain
} = electron;

let todayWindow;
let formWindow;
let historyWindow;

let allRent =[];
var fs = require("fs");

fs.readFile("database.json", (err, jsonRents) => {
    if(!err){
        const oldRent = JSON.parse(jsonRents);
        allRent = oldRent;
    }
});

app.on("ready", () => {
    todayWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }, 
        title : "Sanjaya Car Rental"
    });

    todayWindow.loadURL(`file://${__dirname}/today.html`);
    todayWindow.on("closed", () => {


        const jsonRent = JSON.stringify(allRent);
        fs.writeFileSync("database.json", jsonRent);

        app.quit();
        todayWindow = null;
    });

    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

});

const historyWindowCreator = () => {
    historyWindow = new BrowserWindow ({
        webPreferences: {
            nodeIntegration: true
        },
        width: 790,
        height: 500,
        title: "Rent History"
    });

    historyWindow.setMenu(null);
    historyWindow.loadURL(`file://${__dirname}/history.html`);
    historyWindow.on("closed", ()  => (historyWindow = null));
};
const formWindowCreator = () => {
    formWindow = new BrowserWindow ({
        webPreferences: {
            nodeIntegration: true
        },
        width: 790,
        height: 500,
        title: "Rent Form"
    });

    formWindow.setMenu(null);
    formWindow.loadURL(`file://${__dirname}/form.html`);
    formWindow.on("closed", ()  => (formWindow = null));
};

ipcMain.on("rent:form", (event, rent) => {
    rent["id"] = uuidv4();
    rent["done"] = 0;
    allRent.push(rent);
    sendTodayRents();
    formWindow.close();
    console.log(allRent);
});

ipcMain.on("rent:request:history", event => {
    historyWindow.webContents.send('rent:response:history', allRent);
});

ipcMain.on("rent:request:today", event => {
    sendTodayRents();
    console.log("here2");
});

ipcMain.on("rent:done", (event,id) => {
    allRent.forEach(rent => {
        rent.done = 1
    })
    sendTodayRents()
});

const sendTodayRents = () => {
    const today = new Date().toISOString().slice(0,10);
    const filtered = allRent.filter(
        rent => rent.Tglsewa === today
    );

    todayWindow.webContents.send("rent:response:today", filtered);
};

const menuTemplate =  [{
        label: "File",
        submenu:[{
                label: "Rent Car Here!",

                click() {
                    formWindowCreator()
                }
            },
            {
                label: "Rent History",
                click() {
                    historyWindowCreator();
                }
            },
            {
                label: "Quit",
                accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl + Q",
                click() {
                    app.quit();
                }
            }
        ]
    },

    {

        label: "View",
        submenu: [{ role: "reload" }, { role: "toggledevtools" }]
    }


]
