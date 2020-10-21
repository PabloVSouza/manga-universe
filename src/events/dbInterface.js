import { Chapter, Manga, User, ReadProgress } from "@/db"
import { ipcMain } from "electron"

let win

const setWin = (extWin) => {
	win = extWin
	eventList()
}

const eventList = () => {
	ipcMain.on("get_available_mangas", () => {
		Manga.find({})
			.sort({ createdAt: 1 })
			.exec((err, result) => {
				if (result) {
					try {
						win.webContents.send("available_mangas", result)
					} catch (e) {
						console.log(e)
					}
				}
			})
	})

	ipcMain.on("get_available_chapters", (event, manga_id) => {
		Chapter.find({ manga_id })
			.sort({ number: 1 })
			.exec((err, result) => {
				if (result) {
					try {
						win.webContents.send("available_chapters", result)
					} catch (e) {
						console.log(e)
					}
				}
			})
	})
}

ipcMain.on("get_available_users", () => {
	User.find({})
		.sort({ updatedAt: 1 })
		.exec((err, result) => {
			if (result) {
				try {
					win.webContents.send("available_users", result)
				} catch (e) {
					console.log(e)
				}
			}
		})
})

ipcMain.on("create_user", (event, data) => {
	User.insert(data, (err, res) => {
		if (res) {
			try {
				win.webContents.send("updated_users")
			} catch (e) {
				console.log(e)
			}
		}
	})
})

ipcMain.on("update_user", (event, user) => {
	User.update({ _id: user._id }, { $set: user }, (err, res) => {
		if (res) {
			try {
				win.webContents.send("updated_users")
			} catch (e) {
				console.log(e)
			}
		}
		if (err) {
			console.log(err)
		}
	})
})

ipcMain.on("remove_user", (event, user) => {
	User.remove({ _id: user._id })
	ReadProgress.remove({ user_id: user._id })
	try {
		win.webContents.send("removed_user")
	} catch (e) {
		console.log(e)
	}
})

ipcMain.on("get_read_progress", (event, data) => {
	ReadProgress.find({ user_id: data.user_id }, (err, response) => {
		try {
			win.webContents.send("read_progress", response)
		} catch (e) {
			console.log()
		}
	})
})

ipcMain.on("update_progress", (event, data) => {
	ReadProgress.findOne(
		{ user_id: data.user_id, chapter_id: data.chapter_id },
		(err, res) => {
			if (res) {
				ReadProgress.update(
					{ _id: res._id },
					{
						$set: {
							currentPage: data.currentPage,
							totalPages: data.totalPages,
						},
					},
					() => {
						try {
							win.webContents.send("updated_progress")
						} catch (e) {
							console.log()
						}
					}
				)
			} else {
				ReadProgress.insert(
					{
						chapter_id: data.chapter_id,
						user_id: data.user_id,
						totalPages: data.totalPages,
						currentPage: data.currentPage,
					},
					() => {
						try {
							win.webContents.send("updated_progress")
						} catch (e) {
							console.log()
						}
					}
				)
			}
		}
	)
})

const dbInterface = {
	setWin,
}

export default dbInterface
