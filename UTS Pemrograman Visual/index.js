const electron = require("electron");
const { v4 : uuidv4 } = require('uuid');
uuidv4();
const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
} = electron;

let sewaWindow;
let datapenyewaanWindow;

let booklist = [];

app.on("ready", () => {
    sewaWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 800,
        height: 650,
        title : "Aplikasi Rental Mobil"
    });

    sewaWindow.loadURL(`file://${__dirname}/menu.html`);
    sewaWindow.on("closed", () => {

        app.quit();
        sewaWindow = null;
    });
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

const datapenyewaanWindowCreator = () => {
    datapenyewaanWindow = new BrowserWindow ({
        webPreferences: {
            nodeIntegration: true
        },
        width: 600,
        height: 400,
        title: "Data Penyewaan Mobil"
    });

    datapenyewaanWindow.setMenu(null);
    datapenyewaanWindow.loadURL(`file://${__dirname}/data.html`);
    datapenyewaanWindow.on("closed", ()  => (datapenyewaanWindow = null));
};

ipcMain.on("booking:create", (event, booking) => {
    booking["id"] = uuidv4();
    booking["done"] = 0;
    booklist.push(booking);

    console.log(booklist);
});

ipcMain.on("booking:request:book", event => {
    datapenyewaanWindow.webContents.send('booking:response:book', booklist);
});

ipcMain.on("booking:request:menu", event => {
    console.log("here2");
});

ipcMain.on("booking:done", (event,id) => {
    console.log("here3");
});

const menuTemplate = [{
        label: "File",
        submenu:[{
                label: "Booking List",

                click() {
                    datapenyewaanWindowCreator()
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