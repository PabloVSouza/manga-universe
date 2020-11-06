import vex from "@/plugins/vex"
import { createStore } from "vuex"
import router from "@/router"

const { ipcRenderer } = require("electron")

export default createStore({
	state: {
		app: {
			wallpaper: {
				active: "",
				list: [],
				mode: "cover",
			},
			folder: "",
			version: "",
		},
		loading: {
			active: false,
			message: "",
			progress: {
				current: 0,
				total: 10,
			},
		},
		downloader: {
			mangaList: [],
			chapterList: [],
			activeManga: {},
			downloadQueue: [],
			activeComponent: "Search",
		},
		reader: {
			activeManga: {},
			activeChapter: {},
		},
		users: {
			activeUser: {},
			userList: [],
			createUser: false,
			userMenu: false,
		},
	},

	mutations: {
		SET_APP(state, app) {
			state.app = app
		},

		SET_LOADING(state, loading) {
			state.loading = loading
		},

		SET_DOWNLOADER(state, downloader) {
			state.downloader = downloader
		},

		SET_READER(state, reader) {
			state.reader = reader
		},

		SET_USERS(state, users) {
			state.users = users
		},
	},

	actions: {
		setupIpc() {
			//App Events

			ipcRenderer.send("get_wallpaper_settings")
			ipcRenderer.on("wallpaper_settings", (event, settings) => {
				if (this.state.app.wallpaper.active == "") {
					this.state.app.wallpaper = JSON.parse(JSON.stringify(settings))
				}
			})

			ipcRenderer.send("get_wallpaper_list")
			ipcRenderer.on("wallpaper_list", (event, list) => {
				this.state.app.wallpaper.list = list
			})

			ipcRenderer.send("get_app_version")

			ipcRenderer.on("app_version", (event, version) => {
				this.state.app.version = version
			})

			ipcRenderer.send("get_app_folder")

			ipcRenderer.on("app_folder", (event, dir) => {
				this.state.app.folder = dir
			})

			ipcRenderer.on("connection_error", () => {
				this.state.loading.active = false
				this.state.loading.message = ""
				this.state.downloader.downloadQueue = []
				vex.dialog.alert({
					message: "Ocorreu um erro de conexão",
				})
			})

			ipcRenderer.on("loading", (event, param) => {
				this.state.loading.active = param
			})

			ipcRenderer.on("loading_message", (event, param) => {
				this.state.loading.message = param
			})

			ipcRenderer.on("loading_progress", (event, param) => {
				this.state.loading.progress = JSON.parse(JSON.stringify(param))
			})

			ipcRenderer.on("change_route", (event, route) => {
				router.push(route)
			})

			//Downloader Events

			ipcRenderer.on("finished_download", () => {
				ipcRenderer.send("get_available_mangas")
			})

			ipcRenderer.on("search_result", (event, result) => {
				this.state.downloader.mangaList = result.series
			})

			ipcRenderer.on("finished_queue", () => {
				this.state.downloader.downloadQueue = []
			})

			ipcRenderer.on("manga_description_result", (event, result) => {
				this.state.downloader.activeManga.description = result
				ipcRenderer.send(
					"get_chapters",
					this.state.downloader.activeManga.id_serie
				)
			})

			ipcRenderer.on("chapter_result", (event, result) => {
				this.state.downloader.chapterList = result
				this.state.downloader.activeComponent = "Detail"
			})
		},
		getMangaDetail(event, param) {
			if (!param) {
				ipcRenderer.send(
					"get_manga_description",
					JSON.parse(JSON.stringify(this.state.downloader.activeManga))
				)
			} else {
				ipcRenderer.send("get_chapters", this.state.reader.activeManga.id_site)
			}
		},
	},

	modules: {},
})
