import vex from "@/plugins/vex"
import { createStore } from "vuex"
import router from "@/router"

const { ipcRenderer } = require("electron")

export default createStore({
	state: {
		app: {
			wallpaper: "",
			Folder: "",
			Version: "",
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
			detail: false,
		},
		reader: {
			mangaList: [],
			chapterList: [],
			activeManga: {},
			activeChapter: {},
			readProgress: [],
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

			ipcRenderer.send("get_wallpaper")

			ipcRenderer.on("wallpaper", (event, file) => {
				this.state.app.wallpaper = file
			})

			ipcRenderer.send("get_app_version")

			ipcRenderer.on("app_version", (event, version) => {
				this.state.app.Version = version
			})

			ipcRenderer.send("get_app_folder")

			ipcRenderer.on("app_folder", (event, dir) => {
				this.state.app.Folder = dir
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

			//User Events

			ipcRenderer.send("get_available_users")

			ipcRenderer.on("created_user", () => {
				ipcRenderer.send("get_available_users")
				this.state.users.createUser = false
			})

			ipcRenderer.on("updated_users", () => {
				this.state.users.createUser = false
				ipcRenderer.send("get_available_users")
			})

			ipcRenderer.on("removed_user", () => {
				ipcRenderer.send("get_available_users")
			})

			ipcRenderer.on("available_users", (event, result) => {
				this.state.users.userList = result
			})

			//Reader Events

			ipcRenderer.send("get_available_mangas")

			ipcRenderer.on("available_mangas", (event, result) => {
				this.state.reader.mangaList = result
				if (this.state.reader.mangaList.length > 0) {
					if (this.state.reader.activeManga._id == undefined) {
						this.state.reader.activeManga = this.state.reader.mangaList[0]
					}
					ipcRenderer.send(
						"get_available_chapters",
						this.state.reader.activeManga._id
					)
				}
			})

			ipcRenderer.on("available_chapters", (event, result) => {
				this.state.reader.chapterList = result
			})

			ipcRenderer.on("read_progress", (event, result) => {
				this.state.reader.readProgress = result
			})

			ipcRenderer.on("updated_progress", () => {
				ipcRenderer.send("get_read_progress", {
					user_id: this.state.users.activeUser._id,
				})
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
				this.state.downloader.detail = true
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
		getProgress() {
			ipcRenderer.send("get_read_progress", {
				user_id: this.state.users.activeUser._id,
			})
		},
	},

	modules: {},
})
