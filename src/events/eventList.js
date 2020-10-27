import { ipcMain } from "electron"
import apiInterface from "./apiInterface"
import dbInterface from "./dbInterface"

const { app } = require("electron")
const fs = require("fs")

let win

const setWin = (extWin) => {
	win = extWin
	apiInterface.setWin(extWin)
	dbInterface.setWin(extWin)
	eventList()
}

const eventList = () => {
	ipcMain.on("change_window_title", (event, param) => {
		win.title = param
	})

	ipcMain.on("get_app_folder", () => {
		try {
			win.webContents.send("app_folder", app.getPath("userData"))
		} catch (e) {
			//Ignore
		}
	})

	ipcMain.on("get_app_version", () => {
		try {
			win.webContents.send("app_version", app.getVersion())
		} catch (e) {
			//ignore
		}
	})

	ipcMain.on("get_wallpaper", async () => {
		fs.readdir(app.getPath("userData"), function(err, files) {
			files.forEach(function(file) {
				if (file.substring(0, file.indexOf(".")) == "wallpaper") {
					try {
						win.webContents.send("wallpaper", file)
					} catch (e) {
						//Ignore
					}
				}
			})
		})
	})
}

const modules = {
	setWin,
	eventList,
}

export default modules
