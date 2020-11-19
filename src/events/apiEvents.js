import { ipcMain, app, BrowserWindow } from "electron"
import crypto from "crypto-js"
const axios = require("axios")
const qs = require("qs")
const _ = require("lodash")
const fs = require("fs")
const downloadDir = `${app.getPath("userData")}/mangas`
let siteUrl = ""
let win

const eventList = () => {
	win = BrowserWindow.getAllWindows()[0]

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
			win.webContents.send("loading", true)
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
					win.webContents.send("loading", false)
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

			const id = manga.id_site == undefined ? manga.id_serie : manga.id_site

			getChapterPages(currentPage)

			function getChapterPages(page) {
				axios
					.get(
						`${siteUrl}/series/chapters_list.json?page=${page}&id_serie=${id}`
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
		win.webContents.send("loading", true)
		win.webContents.send("loading_message", `Criando o diretório`)

		let dirData = await createDirectory(mangaData, chapter)

		win.webContents.send("loading_message", `Acessando a API`)

		let coverName

		if (mangaData._id == undefined)
			coverName = await downloadCover(mangaData, dirData)
		else {
			coverName = decodeURI(mangaData.cover).substring(
				decodeURI(mangaData.cover).lastIndexOf("\\") + 1
			)
		}

		let { id_release, link } = chapter.releases[
			Object.getOwnPropertyNames(chapter.releases)[0]
		]

		let disqusKey = await getDisqusKey(link)

		const pages = await getPages(id_release, disqusKey)

		let fileList = []

		win.webContents.send(
			"loading_message",
			`Baixando capítulo ${chapter.number}`
		)

		const progress = {
			total: pages.length,
			current: 0,
		}

		for (const page of pages) {
			progress.current++
			let fileName = await downloadPage(page, dirData)

			win.webContents.send("loading_progress", progress)

			if (fileName) {
				fileList.push(fileName)
			}
		}

		win.webContents.send("loading_message", "")
		win.webContents.send("loading_progress", { total: 10, current: 0 })
		win.webContents.send("loading", false)
		return new Promise((resolve) => {
			resolve({
				coverName,
				fileList,
			})
		})
	})
}

const getDisqusKey = (link) => {
	return new Promise((resolve) => {
		axios
			.get(`${siteUrl}${link}`)
			.then((getDisqusKey) => {
				let disqusKey = getDisqusKey.data
					.substring(getDisqusKey.data.lastIndexOf('this.page.identifier = "'))
					.substring(
						getDisqusKey.data
							.substring(
								getDisqusKey.data.lastIndexOf('this.page.identifier = "')
							)
							.indexOf('"') + 1,
						getDisqusKey.data
							.substring(
								getDisqusKey.data.lastIndexOf('this.page.identifier = "')
							)
							.indexOf(";") - 1
					)

				resolve(disqusKey)
			})
			.catch((e) => {
				console.log(e)
				win.webContents.send("connection_error")
			})
	})
}

const createDirectory = (mangaData, chapter) => {
	return new Promise((resolve) => {
		const filterFolderName = mangaData.name.replace(":", "-")
		const pagesDownloadDir = `${downloadDir}/${filterFolderName}/${chapter.number}/`
		if (!fs.existsSync(pagesDownloadDir)) {
			fs.mkdirSync(pagesDownloadDir, {
				recursive: true,
			})
		}

		resolve({ filterFolderName, pagesDownloadDir })
	})
}

const downloadCover = (mangaData, dirData) => {
	return new Promise((resolve, reject) => {
		const coverUrl = mangaData.cover
		const coverDownloadDir = `${downloadDir}/${dirData.filterFolderName}`
		const coverFileName = coverUrl.substring(
			coverUrl.lastIndexOf("/") + 1,
			coverUrl.lastIndexOf("?")
		)

		axios({
			method: "get",
			url: coverUrl,
			responseType: "stream",
		})
			.then((res) => {
				res.data.pipe(
					fs.createWriteStream(`${coverDownloadDir}/${coverFileName}`)
				)
				resolve(coverFileName)
			})
			.catch((e) => {
				reject(e)
			})
	}).catch((e) => {
		console.log(e)
		win.webContents.send("connection_error")
	})
}

const getPages = (id_release, disqusKey) => {
	return new Promise((resolve) => {
		axios
			.get(`${siteUrl}/leitor/pages/${id_release}.json?key=${disqusKey}`)
			.then((res) => {
				resolve(res.data.images)
			})
			.catch((e) => {
				console.log(e)
				win.webContents.send("connection_error")
			})
	})
}

const downloadPage = (page, dirData) => {
	return new Promise((resolve) => {
		let fileName = page.substring(page.lastIndexOf("/") + 1)

		axios({
			method: "get",
			url: page,
			responseType: "stream",
		})
			.then((res) => {
				res.data.pipe(fs.createWriteStream(dirData.pagesDownloadDir + fileName))
				resolve(fileName)
			})
			.catch(() => {
				resolve(fileName)
			})
	})
}

export default eventList
