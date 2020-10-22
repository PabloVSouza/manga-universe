<template>
	<div id="Detail">
		<button
			class="closeButton"
			id="closeDetail"
			@click.prevent="$emit('close-detail')"
		>
			X
		</button>
		<div id="cover">
			<img :src="mangaInfo.cover" :alt="mangaInfo.name" />
		</div>
		<div id="info">
			<h1>
				{{ mangaInfo.name }}
			</h1>
			<p>
				<span>{{ $lang.Downloader.Detail.author }}:</span>
				{{ mangaInfo.author }}
			</p>
			<p>
				<span>{{ $lang.Downloader.Detail.artist }}:</span>
				{{ mangaInfo.artist }}
			</p>
			<p>
				<span>{{ $lang.Downloader.Detail.genre }}:</span>
				<template v-for="categorie in mangaInfo.categories">
					{{ categorie.name }},
				</template>
			</p>
			<p>
				<span>{{ $lang.Downloader.Detail.description }}:</span>
				{{ mangaInfo.description }}
			</p>
		</div>
		<div id="menuChapters">
			{{ downloader.downloadQueue.length }}
			{{ $lang.Downloader.Detail.downloadQueue }}.
			<button
				@click.prevent="downloadFromQueue"
				:title="$lang.Downloader.Detail.titleDownloadQueue"
			>
				<img src="@/assets/download-icon-2.svg" alt="download" />
			</button>
			<button @click="markAll()" :title="$lang.Downloader.Detail.titleMarkAll">
				<img src="@/assets/clipboard.svg" alt="clipboard" />
			</button>
		</div>
		<div id="chapters">
			<h3>{{ $lang.Downloader.Detail.chapters }}:</h3>
			<ul>
				<li
					v-for="(chapter, key) in downloader.chapterList"
					:key="key"
					@click="downloadChapter(chapter)"
					:style="[
						alreadyDownloaded(chapter) ? { backgroundColor: 'green' } : {},
						onQueue(chapter) ? { backgroundColor: 'rgb(150,150,30)' } : {},
					]"
				>
					{{ chapter.number }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import { mapState } from "vuex"
const { ipcRenderer } = require("electron")

export default {
	computed: {
		...mapState(["downloader", "reader", "appFolder"]),

		mangaInfo() {
			if (this.downloadMore) {
				let objReturn = JSON.parse(JSON.stringify(this.reader.activeManga))

				objReturn.categories = objReturn.genres

				objReturn.cover = this.coverDirectory(objReturn)
				return objReturn
			} else {
				return this.downloader.activeManga
			}
		},

		mangaList() {
			return this.reader.mangaList
		},
	},

	props: ["downloadMore"],

	created() {
		this.activateManga()
	},

	methods: {
		activateManga() {
			let findManga = this.reader.mangaList.find(
				(manga) => manga.id_site == this.downloader.activeManga.id_serie
			)
			if (findManga) {
				this.reader.activeManga = findManga

				ipcRenderer.send("get_available_chapters", this.reader.activeManga._id)
			}
		},

		coverDirectory(manga) {
			const filterFolderName = manga.name.replace(":", "-")

			const directory = `file:///${this.appFolder}/mangas/${filterFolderName}/${manga.cover}`

			return directory
		},

		downloadChapter(chapter) {
			if (!this.alreadyDownloaded(chapter)) {
				this.downloader.downloadQueue.push(JSON.parse(JSON.stringify(chapter)))
			}
		},

		downloadFromQueue() {
			ipcRenderer.send(
				"download_queue",
				this.mangaInfo,
				this.downloader.downloadQueue
			)
		},

		alreadyDownloaded(chapter) {
			let res = false
			const downloadedChapter = this.reader.chapterList.find(
				(ch) => ch.id_site == chapter.id_chapter
			)

			if (downloadedChapter) {
				res = true
			}

			return res
		},

		onQueue(chapter) {
			let res = false

			const on = this.downloader.downloadQueue.find(
				(dq) => dq.id_chapter == chapter.id_chapter
			)

			if (on) {
				res = true
			}

			return res
		},

		markAll() {
			if (this.downloader.downloadQueue.length > 0) {
				this.downloader.downloadQueue = []
			} else {
				for (const ch of this.downloader.chapterList) {
					if (!this.alreadyDownloaded(ch)) {
						this.downloader.downloadQueue.push(JSON.parse(JSON.stringify(ch)))
					}
				}
			}
		},
	},

	watch: {
		mangaList() {
			this.activateManga()
		},
	},
}
</script>

<style lang="scss">
#closeDetail {
	&:hover {
		background-color: rgba(200, 200, 200, 1) !important;
	}
}

#Detail {
	position: absolute;
	height: 100%;
	width: 100%;
	top: 0;
	left: 0;
	border-radius: 5px;
	background-color: rgba(255, 255, 255, 0.9);
	padding: 10px;
	overflow: auto;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	z-index: 2;

	#cover {
		width: 200px;
		margin: 0 15px;
		img {
			width: 100%;
		}
	}

	#info {
		margin: 0 15px;
		max-width: 500px;
		display: inline-block;
		h1 {
			font-weight: lighter;
			margin-bottom: 10px;
		}
		p {
			margin: 5px 0;
			span {
				font-weight: bold;
			}
		}
	}

	#menuChapters {
		width: 100%;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 10px;

		button {
			width: 50px;
			height: 50px;
			border: none;
			background: none;
			padding: 10px;
			margin-left: 5px;
			cursor: pointer;
			border-radius: 5px;
			transition: background-color 0.6s ease;
			&:hover {
				background-color: rgba(200, 200, 200, 1);
			}
		}
	}

	#chapters {
		margin-top: 10px;
		width: 100%;
		ul {
			display: flex;
			flex-wrap: wrap;
			list-style: none;
			justify-content: center;
			li {
				width: 130px;
				margin: 10px;
				text-align: center;
				background-color: rgba(78, 78, 78, 0.9);
				color: white;
				padding: 10px;
				border-radius: 5px;
				cursor: pointer;
				transition: background-color 0.6s ease;

				&:hover {
					background-color: rgba(128, 128, 128, 0.9);
				}
			}
		}
	}
}
</style>
