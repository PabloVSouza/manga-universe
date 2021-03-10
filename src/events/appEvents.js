import { ipcMain, BrowserWindow } from "electron"

const { app } = require("electron")
const fs = require("fs")
import path from "path"

let win

const eventList = () => {
	win = BrowserWindow.getAllWindows()[0]

	ipcMain.handle("change_window_title", (event, param) => {
		win.title = `Manga Universe v${app.getVersion()} ${param}`
	})

	ipcMain.handle("get_app_folder", () => {
		return new Promise((resolve) => {
			resolve(app.getPath("userData"))
		})
	})

	ipcMain.handle("new_wallpaper", (event, file) => {
		return new Promise((resolve) => {
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

				resolve(fileList)
			})
		})
	})

	ipcMain.handle("write_wallpaper_settings", (event, json) => {
		return new Promise((resolve) => {
			fs.writeFileSync(`${app.getPath("userData")}/wallpaper.ini`, json)
			resolve(JSON.parse(json))
		})
	})

	ipcMain.handle("get_wallpaper_info", () => {
		return new Promise((resolve) => {
			let file = ""

			if (fs.existsSync(path.join(app.getPath("userData"), "wallpaper.ini"))) {
				file = fs
					.readFileSync(path.join(app.getPath("userData"), "wallpaper.ini"))
					.toString()
			}
			resolve(JSON.parse(file))
		})
	})

	ipcMain.handle("get_wallpaper_list", async () => {
		return new Promise((resolve) => {
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

				resolve(fileList)
			})
		})
	})
}

export default eventList
