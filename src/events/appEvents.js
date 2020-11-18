import { ipcMain, BrowserWindow } from "electron"

const { app } = require("electron")
const fs = require("fs")
import path from "path"

let win

const eventList = () => {
	win = BrowserWindow.getAllWindows()[0]

	ipcMain.on("change_window_title", (event, param) => {
		win.title = `Manga Universe v${app.getVersion()} ${param}`
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

	ipcMain.on("new_wallpaper", (event, file) => {
		const fileName = file.substring(file.lastIndexOf("\\"))
		fs.copyFileSync(
			file,
			path.join(app.getPath("userData"), "wallpaper", fileName)
		)
		fs.readdir(path.join(app.getPath("userData"), "wallpaper"), function(
			err,
			files
		) {
			let fileList = []

			files.forEach(function(file) {
				if (
					file.substring(file.indexOf(".")) == ".png" ||
					file.substring(file.indexOf(".")) == ".jpg" ||
					file.substring(file.indexOf(".")) == ".jpeg" ||
					file.substring(file.indexOf(".")) == ".svg" ||
					file.substring(file.indexOf(".")) == ".gif"
				) {
					fileList.push(file)
				}
			})
			try {
				win.webContents.send("wallpaper_list", fileList)
			} catch (e) {
				//Ignore
			}
		})
	})

	ipcMain.on("write_wallpaper_settings", (event, json) => {
		fs.writeFileSync(`${app.getPath("userData")}/wallpaper.ini`, json)
		win.webContents.send("wallpaper_settings", JSON.parse(json))
	})

	ipcMain.on("get_wallpaper_settings", () => {
		let file = ""

		if (fs.existsSync(path.join(app.getPath("userData"), "wallpaper.ini"))) {
			file = fs
				.readFileSync(path.join(app.getPath("userData"), "wallpaper.ini"))
				.toString()
		}
		try {
			win.webContents.send("wallpaper_settings", JSON.parse(file))
		} catch (e) {
			//ignore
		}
	})

	ipcMain.on("get_wallpaper_list", async () => {
		if (!fs.existsSync(path.join(app.getPath("userData"), "wallpaper"))) {
			fs.mkdirSync(path.join(app.getPath("userData"), "wallpaper"), {
				recursive: true,
			})
		}

		fs.readdir(path.join(app.getPath("userData"), "wallpaper"), function(
			err,
			files
		) {
			let fileList = []

			files.forEach(function(file) {
				if (
					file.substring(file.indexOf(".")) == ".png" ||
					file.substring(file.indexOf(".")) == ".jpg" ||
					file.substring(file.indexOf(".")) == ".jpeg" ||
					file.substring(file.indexOf(".")) == ".svg" ||
					file.substring(file.indexOf(".")) == ".gif"
				) {
					fileList.push(file)
				}
			})
			try {
				win.webContents.send("wallpaper_list", fileList)
			} catch (e) {
				//Ignore
			}
		})
	})
}

export default eventList
