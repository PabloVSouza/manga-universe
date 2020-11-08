const axios = require("axios")
const fs = require("fs")
const { app } = require("electron")
const { Manga, Chapter } = require("@/db")
const downloadDir = `${app.getPath("userData")}/mangas`
let siteUrl = ""

let win

const setWin = (extWin, url) => {
	win = extWin
	siteUrl = url
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

async function recordManga(data) {
	return new Promise((resolve) => {
		Manga.findOne({ name: data.name }, (err, findManga) => {
			if (findManga) {
				if (findManga.id_site != undefined) {
					data.id_site = findManga.id_site
				}
				Manga.update({ _id: findManga._id }, { $set: data })
				resolve(findManga)
			} else {
				Manga.insert(data, (error, newManga) => {
					resolve(newManga)
				})
			}
		})
	})
}

function recordChapter(data) {
	return new Promise((resolve) => {
		Chapter.findOne(
			{ number: data.number, manga_id: data.manga_id },
			(err, findChapter) => {
				if (findChapter) {
					resolve(findChapter)
				} else {
					Chapter.insert(data, (err, newChapter) => {
						resolve(newChapter)
					})
				}
			}
		)
	})
}

const downloadChapter = async (mangaData, chapter) => {
	win.webContents.send("loading", true)
	win.webContents.send("loading_message", `Criando o diretório`)

	let dirData = await createDirectory(mangaData, chapter)

	let mangaWriteData = {
		name: mangaData.name,
		author: mangaData.author,
		artist: mangaData.artist,
		genres: mangaData.categories,
		description: mangaData.description,
		id_site: mangaData.id_serie,
	}

	if (mangaData.id_serie != undefined) {
		mangaWriteData.cover = await downloadCover(mangaData, dirData)
	}

	win.webContents.send("loading_message", `Acessando a API`)

	let { id_release, link } = chapter.releases[
		Object.getOwnPropertyNames(chapter.releases)[0]
	]

	let disqusKey = await getDisqusKey(link)

	const pages = await getPages(id_release, disqusKey)

	let fileList = []

	win.webContents.send("loading_message", `Baixando capítulo ${chapter.number}`)

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

	let chapterWriteData = {
		manga_id: "",
		manga_name: mangaWriteData.name,
		name: chapter.chapter_name,
		number: Number(chapter.number),
		id_site: chapter.id_chapter,
		pages: fileList,
	}

	let manga = await recordManga(mangaWriteData)

	chapterWriteData.manga_id = manga._id

	await recordChapter(chapterWriteData)
	win.webContents.send("finished_download")
	win.webContents.send("loading_message", "")
	win.webContents.send("loading_progress", { total: 10, current: 0 })
	win.webContents.send("loading", false)
}

const mangaApi = {
	downloadChapter,
	setWin,
}

export default mangaApi
