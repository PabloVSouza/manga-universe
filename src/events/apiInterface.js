import { ipcMain, app } from "electron"
import mangaApi from "@/api/mangaApi"
import crypto from "crypto-js"
const fs = require("fs")

let win

const setWin = (extWin) => {
	win = extWin
	eventList()
}

const eventList = () => {
	ipcMain.on("check_url", () => {
		urlCheck()
	})

	ipcMain.on("write_url", (event, url) => {
		fs.writeFileSync(`${app.getPath("userData")}/url.ini`, url)
		urlCheck()
		win.webContents.send("change_route", "/")
	})

	ipcMain.on("download_chapter", async (event, mangaData, chapter) => {
		await mangaApi.downloadChapter(mangaData, chapter)
	})

	ipcMain.on("download_queue", async (event, mangaData, queue) => {
		console.log(mangaData)
		for (const chapter of queue) {
			await mangaApi.downloadChapter(mangaData, chapter)
		}
		win.webContents.send("finished_queue")
	})

	ipcMain.on("search_manga", async (event, searchData) => {
		try {
			win.webContents.send("loading", true)

			mangaApi.searchManga(searchData).then((result) => {
				win.webContents.send("search_result", result)
				win.webContents.send("loading", false)
			})
		} catch (e) {
			console.log()
		}
	})

	ipcMain.on("get_manga_description", async (event, manga) => {
		try {
			win.webContents.send("loading", true)
			mangaApi.getMangaDescription(manga).then((result) => {
				win.webContents.send("manga_description_result", result)
			})
		} catch (e) {
			console.log()
		}
	})

	ipcMain.on("get_chapters", async (event, manga) => {
		try {
			win.webContents.send("loading", true)
			mangaApi.getChapters(manga).then((result) => {
				win.webContents.send("chapter_result", result)
				win.webContents.send("loading", false)
			})
		} catch (e) {
			console.log()
		}
	})
}

const urlCheck = () => {
	if (fs.existsSync(`${app.getPath("userData")}/url.ini`)) {
		let urlFile = fs
			.readFileSync(`${app.getPath("userData")}/url.ini`)
			.toString()

		if (crypto.MD5(urlFile) != "78085432a8a6d275813f122c6c88c416") {
			win.webContents.send("change_route", "/url")
		} else {
			mangaApi.setWin(win, urlFile)
		}
	} else {
		win.webContents.send("change_route", "/url")
	}
}

const modules = {
	setWin,
	eventList,
}

export default modules
