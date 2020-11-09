<template>
	<div id="Detail">
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
					v-for="(chapter, key) in downloader.activeManga.chapters"
					:key="key"
					@click="addToQueue(chapter)"
					:style="[
						alreadyDownloaded(chapter)
							? { backgroundColor: 'rgb(80,150,30)' }
							: {},
						onQueue(chapter) ? { backgroundColor: 'rgb(219, 208, 56)' } : {},
					]"
				>
					{{ chapter.number }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
const { ipcRenderer } = require("electron")

import { useStore } from "vuex"
import { computed, watch } from "vue"

import path from "path"

export default {
	name: "Detail",
	props: ["downloadMore"],
	setup(props) {
		const store = useStore()

		const downloader = computed(() => store.state.downloader)
		const reader = computed(() => store.state.reader)
		const app = computed(() => store.state.app)
		const mangaList = computed(() => store.state.reader.mangaList)

		const mangaInfo = computed(() => {
			if (props.downloadMore) {
				let objReturn = JSON.parse(JSON.stringify(reader.value.activeManga))

				objReturn.categories = objReturn.genres

				objReturn.cover = coverDirectory(objReturn)
				return objReturn
			} else {
				return downloader.value.activeManga
			}
		})

		const activateManga = () => {
			let findManga = mangaList.value.find(
				(manga) => manga.id_site == downloader.value.activeManga.id_serie
			)
			if (findManga) {
				reader.value.activeManga = findManga

				ipcRenderer.send("get_available_chapters", reader.value.activeManga._id)
			}
		}

		const coverDirectory = (manga) => {
			const filterFolderName = manga.name.replace(":", "-")

			const directory = `file:///${encodeURI(
				path.join(app.value.folder, "mangas", filterFolderName, manga.cover)
			)}`

			return directory
		}

		const addToQueue = (chapter) => {
			if (!alreadyDownloaded(chapter)) {
				const findInQueue = downloader.value.downloadQueue.findIndex(
					(row) => row.id_chapter == chapter.id_chapter
				)

				if (findInQueue < 0) {
					downloader.value.downloadQueue.push(
						JSON.parse(JSON.stringify(chapter))
					)
				} else {
					downloader.value.downloadQueue.splice(findInQueue, 1)
				}
			}
		}

		const downloadFromQueue = async () => {
			for (const chapter of downloader.value.downloadQueue) {
				const download = await ipcRenderer.invoke(
					"download_chapter",
					JSON.parse(JSON.stringify(mangaInfo.value)),
					JSON.parse(JSON.stringify(chapter))
				)

				const mangaWriteData = {
					name: mangaInfo.value.name,
					author: mangaInfo.value.author,
					artist: mangaInfo.value.artist,
					genres: mangaInfo.value.categories,
					description: mangaInfo.value.description,
					id_site: mangaInfo.value.id_serie,
					cover: download.coverName,
				}

				let exist = await ipcRenderer.invoke("db-update", {
					table: "Manga",
					query: {
						name: JSON.parse(JSON.stringify(mangaInfo.value.name)),
					},
					data: JSON.parse(JSON.stringify(mangaWriteData)),
				})

				if (exist === 0) {
					exist = await ipcRenderer.invoke("db-insert", {
						table: "Manga",
						data: JSON.parse(JSON.stringify(mangaWriteData)),
					})
				}

				if (exist === 1) {
					exist = await ipcRenderer.invoke("db-find", {
						table: "Manga",
						query: { name: JSON.parse(JSON.stringify(mangaInfo.value.name)) },
					})
				}

				const chapterWriteData = {
					manga_id: exist._id,
					manga_name: mangaWriteData.name,
					name: chapter.chapter_name,
					number: Number(chapter.number),
					id_site: chapter.id_chapter,
					pages: download.fileList,
				}

				await ipcRenderer.invoke("db-insert", {
					table: "Chapter",
					data: JSON.parse(JSON.stringify(chapterWriteData)),
				})
			}
		}

		const alreadyDownloaded = (chapter) => {
			let res = false
			const downloadedChapter = reader.value.chapterList.find(
				(ch) => ch.id_site == chapter.id_chapter
			)

			if (downloadedChapter) {
				res = true
			}

			return res
		}

		const onQueue = (chapter) => {
			let res = false

			const on = downloader.value.downloadQueue.find(
				(dq) => dq.id_chapter == chapter.id_chapter
			)

			if (on) {
				res = true
			}

			return res
		}

		const markAll = () => {
			if (downloader.value.downloadQueue.length > 0) {
				downloader.value.downloadQueue = []
			} else {
				for (const ch of downloader.value.chapterList) {
					if (!alreadyDownloaded(ch)) {
						downloader.value.downloadQueue.push(JSON.parse(JSON.stringify(ch)))
					}
				}
			}
		}

		activateManga()

		watch(
			() => mangaList.value,
			() => {
				activateManga()
			}
		)

		return {
			downloader,
			mangaList,
			mangaInfo,
			addToQueue,
			downloadFromQueue,
			alreadyDownloaded,
			onQueue,
			markAll,
		}
	},
}
</script>

<style lang="scss">
#Detail {
	position: absolute;
	width: calc(100% - 90px);
	height: calc(100% - 90px);
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
				background-color: rgba(255, 255, 255, 0.6);
				padding: 10px;
				border-radius: 5px;
				cursor: pointer;
				transition: background-color 0.6s ease;
				box-shadow: 2px 6px 16px -5px rgba(0, 0, 0, 0.75);

				&:hover {
					background-color: rgba(255, 255, 255, 0.9);
				}
			}
		}
	}
}
</style>
