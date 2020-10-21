const Datastore = require("nedb")
const { app } = require("electron")

const Manga = new Datastore({
	filename: `${app.getPath("userData")}/db/Manga.db`,
	timestampData: true,
	autoload: true,
})
const Chapter = new Datastore({
	filename: `${app.getPath("userData")}/db/Chapter.db`,
	timestampData: true,
	autoload: true,
})

const User = new Datastore({
	filename: `${app.getPath("userData")}/db/User.db`,
	timestampData: true,
	autoload: true,
})

const ReadProgress = new Datastore({
	filename: `${app.getPath("userData")}/db/ReadProgress.db`,
	timestampData: true,
	autoload: true,
})

const db = {
	Manga,
	Chapter,
	User,
	ReadProgress,
}

module.exports = db
