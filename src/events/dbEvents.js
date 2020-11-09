import db from "@/db"
import { ipcMain } from "electron"

const eventList = () => {
	ipcMain.handle("db-find", async (event, params) => {
		return new Promise((resolve, reject) => {
			if (db[params.table]) {
				db[params.table]
					.find(params.query)
					.sort(params.sort)
					.exec((err, res) => {
						if (!err) {
							resolve(res)
						} else {
							reject(err)
						}
					})
			} else {
				reject("Database not found")
			}
		})
	})

	ipcMain.handle("db-findOne", async (event, params) => {
		return new Promise((resolve, reject) => {
			if (db[params.table]) {
				db[params.table]
					.findOne(params.query)
					.sort(params.sort)
					.exec((err, res) => {
						if (!err) {
							resolve(res)
						} else {
							reject(err)
						}
					})
			} else {
				reject("Database not found")
			}
		})
	})

	ipcMain.handle("db-insert", async (event, params) => {
		return new Promise((resolve, reject) => {
			if (db[params.table]) {
				db[params.table].insert(params.data, (err, res) => {
					if (!err) {
						resolve(res)
					} else {
						reject(err)
					}
				})
			} else {
				reject("Database not found")
			}
		})
	})

	ipcMain.handle("db-update", async (event, params) => {
		return new Promise((resolve, reject) => {
			if (db[params.table]) {
				db[params.table].update(
					params.query,
					{ $set: params.data },
					(err, res) => {
						if (!err) {
							resolve(res)
						} else {
							reject(err)
						}
					}
				)
			} else {
				reject("Database not found")
			}
		})
	})

	ipcMain.handle("db-remove", async (event, params) => {
		return new Promise((resolve, reject) => {
			if (db[params.table]) {
				db[params.table].remove(params.query, (err, res) => {
					if (!err) {
						resolve(res)
					} else {
						reject(err)
					}
				})
			} else {
				reject("Database not found")
			}
		})
	})

	ipcMain.handle("db-fix", async () => {
		return new Promise((resolve) => {
			db.ReadProgress.find({}, (err, allProgress) => {
				if (allProgress.length > 0) {
					if (allProgress[0].manga_id == undefined) {
						for (const prog of allProgress) {
							db.Chapter.findOne({ _id: prog.chapter_id }, (err, found) => {
								db.ReadProgress.update(
									{ _id: prog._id },
									{
										$set: {
											manga_id: found.manga_id,
										},
									}
								)
							})
						}
					}
				}
			})
			resolve()
		})
	})
}

export default eventList
