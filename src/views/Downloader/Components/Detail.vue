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
			{{ state.downloader.downloadQueue.length }}
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
					v-for="(chapter, key) in state.downloader.chapterList"
					:key="key"
					@click="downloadChapter(chapter)"
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
import { reactive, computed, watch } from "vue"

import path from "path"

export default {
	name: "Detail",
	props: ["downloadMore"],
	setup(props) {
		const store = useStore()
		const state = reactive({
			downloader: store.state.downloader,
			reader: store.state.reader,
			app: store.state.app,
		})

		const mangaList = computed(() => {
			return store.state.reader.mangaList
		})

		const mangaInfo = computed(() => {
			if (props.downloadMore) {
				let objReturn = JSON.parse(JSON.stringify(state.reader.activeManga))

				objReturn.categories = objReturn.genres

				objReturn.cover = coverDirectory(objReturn)
				return objReturn
			} else {
				return state.downloader.activeManga
			}
		})

		const activateManga = () => {
			let findManga = mangaList.value.find(
				(manga) => manga.id_site == state.downloader.activeManga.id_serie
			)
			if (findManga) {
				state.reader.activeManga = findManga

				ipcRenderer.send("get_available_chapters", state.reader.activeManga._id)
			}
		}

		const coverDirectory = (manga) => {
			const filterFolderName = manga.name.replace(":", "-")

			const directory = `file:///${encodeURI(
				path.join(state.app.Folder, "mangas", filterFolderName, manga.cover)
			)}`

			return directory
		}

		const downloadChapter = (chapter) => {
			if (!alreadyDownloaded(chapter)) {
				const findInQueue = state.downloader.downloadQueue.findIndex(
					(row) => row.id_chapter == chapter.id_chapter
				)

				if (findInQueue < 0) {
					state.downloader.downloadQueue.push(
						JSON.parse(JSON.stringify(chapter))
					)
				} else {
					state.downloader.downloadQueue.splice(findInQueue, 1)
				}
			}
		}

		const downloadFromQueue = () => {
			const info = JSON.parse(JSON.stringify(mangaInfo.value))
			ipcRenderer.send(
				"download_queue",
				info,
				JSON.parse(JSON.stringify(state.downloader.downloadQueue))
			)
		}

		const alreadyDownloaded = (chapter) => {
			let res = false
			const downloadedChapter = state.reader.chapterList.find(
				(ch) => ch.id_site == chapter.id_chapter
			)

			if (downloadedChapter) {
				res = true
			}

			return res
		}

		const onQueue = (chapter) => {
			let res = false

			const on = state.downloader.downloadQueue.find(
				(dq) => dq.id_chapter == chapter.id_chapter
			)

			if (on) {
				res = true
			}

			return res
		}

		const markAll = () => {
			if (state.downloader.downloadQueue.length > 0) {
				state.downloader.downloadQueue = []
			} else {
				for (const ch of state.downloader.chapterList) {
					if (!alreadyDownloaded(ch)) {
						state.downloader.downloadQueue.push(JSON.parse(JSON.stringify(ch)))
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
			state,
			mangaList,
			mangaInfo,
			downloadChapter,
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
				background-color: rgba(255, 255, 255, 0.3);
				color: white;
				padding: 10px;
				border-radius: 5px;
				cursor: pointer;
				transition: background-color 0.6s ease;
				box-shadow: 2px 6px 16px -5px rgba(0, 0, 0, 0.75);

				&:hover {
					background-color: rgba(255, 255, 255, 0.6);
				}
			}
		}
	}
}
</style>
