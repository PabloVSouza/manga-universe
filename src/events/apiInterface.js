import { ipcMain, app } from "electron"
import mangaApi from "@/api/mangaApi"
import crypto from "crypto-js"
const axios = require("axios")
const qs = require("qs")
const _ = require("lodash")
const fs = require("fs")
let siteUrl = ""

let win = require("electron").remote.getCurrentWindow().id

eventList()

const eventList = () => {
	ipcMain.handle("urlCheck", () => {
		if (fs.existsSync(`${app.getPath("userData")}/url.ini`)) {
			let urlFile = fs
				.readFileSync(`${app.getPath("userData")}/url.ini`)
				.toString()

			if (crypto.MD5(urlFile) != "78085432a8a6d275813f122c6c88c416") {
				win.webContents.send("change_route", "/url")
			} else {
				siteUrl = urlFile
			}
		} else {
			win.webContents.send("change_route", "/url")
		}
	})

	ipcMain.handle("search_manga", async (event, searchData) => {
		return new Promise((resolve) => {
			axios({
				method: "post",
				url: `${siteUrl}/lib/search/series.json`,
				headers: {
					"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
					"x-requested-with": "XMLHttpRequest",
				},
				data: qs.stringify({
					search: searchData,
				}),
			})
				.then((res) => {
					resolve(res.data.series)
				})
				.catch((e) => {
					console.log(e)
					win.webContents.send("connection_error")
				})
		})
	})

	ipcMain.handle("get_manga_description", async (event, manga) => {
		return new Promise((resolve, reject) => {
			axios
				.get(`${siteUrl}/${manga.link}`)
				.then((res) => {
					let res1 = res.data.substring(res.data.indexOf('desc">') + 6)

					let res2 = res1.substring(0, res1.indexOf("<ol") - 3)

					let res3 = res2
						.replace(/<span>/g, "")
						.replace(/<\/span>/g, "")
						.trim()

					resolve(res3)
				})
				.catch(() => {
					reject()
				})
		})
	})

	ipcMain.handle("get_chapters", async (event, manga) => {
		return new Promise(function(resolve) {
			let chaptersList = []
			let currentPage = 1

			getChapterPages(currentPage)

			function getChapterPages(page) {
				axios
					.get(
						`${siteUrl}/series/chapters_list.json?page=${page}&id_serie=${manga.id_serie}`
					)
					.then((res) => {
						let chapters = res.data.chapters
						if (chapters.length != undefined) {
							chaptersList = _.concat(chaptersList, chapters)
							currentPage++
							getChapterPages(currentPage)
						} else {
							resolve(chaptersList.reverse())
						}
					})
					.catch((e) => {
						console.log(e)
						resolve(chaptersList.reverse())
						win.webContents.send("connection_error")
					})
			}
		})
	})

	ipcMain.handle("download_chapter", async (event, mangaData, chapter) => {
		await mangaApi.downloadChapter(mangaData, chapter)
	})

	ipcMain.handle("download_queue", async (event, mangaData, queue) => {
		for (const chapter of queue) {
			await mangaApi.downloadChapter(mangaData, chapter)
		}
		win.webContents.send("finished_queue")
	})
}
