<template>
	<div id="mangaChapterSelection">
		<div id="header">
			<div id="generalContent">
				<h1>{{ reader.activeManga.name }}</h1>
				<p>
					<label>{{ $lang.Home.mangaChapterSelection.author }}:</label>
					{{ reader.activeManga.author }}
				</p>
				<p>
					<label>{{ $lang.Home.mangaChapterSelection.artist }}:</label>
					{{ reader.activeManga.artist }}
				</p>
				<p>
					<label>{{ $lang.Home.mangaChapterSelection.genre }}:</label>
					<template v-for="categorie in reader.activeManga.genres">
						{{ categorie.name }},
					</template>
				</p>
			</div>
			<div id="description">
				<p>
					<label>{{ $lang.Home.mangaChapterSelection.description }}:</label>
					{{ reader.activeManga.description }}
				</p>
			</div>
			<img :src="coverDirectory" alt="" />
		</div>

		<div id="body" class="noSelect">
			<div id="mangaMenu">
				<button
					:title="$lang.Home.mangaChapterSelection.titleDownloadMore"
					@click.prevent="downloadMore()"
				>
					<img src="@/assets/download-icon-2.svg" alt="download" />
				</button>
				<button
					:title="$lang.Home.mangaChapterSelection.titleContinueReading"
					style="float: right"
					@click.prevent="continueReading()"
				>
					<img src="@/assets/comic-book.svg" alt="book" />
				</button>
				<div id="totalProgress">
					<div id="progress" :style="{ width: `${totalProgress}%` }"></div>
				</div>
				<p>{{ totalProgress }}% Lido</p>
			</div>
			<div id="chaptersTable">
				<table>
					<tbody>
						<tr
							v-for="chapter in reader.chapterList"
							:key="chapter._id"
							@dblclick.prevent="readChapter(chapter)"
							:title="$lang.Home.mangaChapterSelection.titleDoubleClickRead"
						>
							<td width="50">{{ chapter.number }}</td>
							<td>{{ chapter.name }}</td>
							<td width="80">{{ chapterProgress(chapter) }}%</td>
							<td
								width="50"
								:title="$lang.Home.mangaChapterSelection.titleMarkAsUnread"
								@click="markAsUnread(chapter)"
							>
								<img src="@/assets/closed-book-icon.svg" alt="" />
							</td>
							<td
								width="50"
								:title="$lang.Home.mangaChapterSelection.titleMarkAsRead"
								@click="markAsRead(chapter)"
							>
								<img src="@/assets/book-stack.svg" alt="" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script>
const { ipcRenderer } = require("electron")

import { computed, watch } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"

import path from "path"

export default {
	name: "mangaChapterSelection",

	setup() {
		const store = useStore()
		const router = useRouter()
		const app = computed(() => store.state.app)
		const reader = computed(() => store.state.reader)
		const users = computed(() => store.state.users)

		function getProgress() {
			ipcRenderer
				.invoke("find", {
					table: "ReadProgress",
					query: {
						manga_id: store.state.reader.activeManga._id,
						user_id: store.state.users.activeUser._id,
					},
					sort: {},
				})
				.then((res) => {
					store.state.reader.readProgress = res
				})
		}

		function getChapters() {
			ipcRenderer
				.invoke("find", {
					table: "Chapter",
					query: {
						manga_id: store.state.reader.activeManga._id,
					},
					sort: { number: 1 },
				})
				.then((res) => {
					store.state.reader.chapterList = res
					getProgress()
				})
		}

		getChapters()

		const totalProgress = computed(() => {
			let total = []
			for (const chapter of reader.value.chapterList) {
				total.push(chapterProgress(chapter))
			}

			const totalSum = total.reduce((value, next) => value + next, 0)

			const all = reader.value.chapterList.length * 100

			return Math.round((100 / all) * totalSum)
		})

		const coverDirectory = computed(() => {
			let directory = ""

			if (reader.value.activeManga._id != undefined) {
				const filterFolderName = reader.value.activeManga.name.replace(":", "-")

				directory = `file:///${encodeURI(
					path.join(
						app.value.folder,
						"mangas",
						filterFolderName,
						reader.value.activeManga.cover
					)
				)}`
			}

			return directory
		})

		const readChapter = (chapter) => {
			store.state.reader.activeChapter = chapter
			router.push("/reader")
		}

		const chapterProgress = (chapter) => {
			const progress = reader.value.readProgress.find(
				(p) => p.chapter_id == chapter._id
			)

			if (progress) {
				if (progress.currentPage > 1) {
					return Math.round((100 / progress.totalPages) * progress.currentPage)
				} else {
					return 0
				}
			} else {
				return 0
			}
		}

		const markAsUnread = (chapter) => {
			ipcRenderer
				.invoke("remove", {
					table: "ReadProgress",
					query: { chapter_id: chapter._id },
				})
				.then(() => {
					getProgress()
				})
		}

		const markAsRead = (chapter) => {
			ipcRenderer
				.invoke("update", {
					table: "ReadProgress",
					query: { chapter_id: chapter._id },
					data: {
						currentPage: chapter.pages.length,
					},
				})
				.then((res) => {
					if (res == 0) {
						ipcRenderer
							.invoke("insert", {
								table: "ReadProgress",
								data: {
									chapter_id: chapter._id,
									user_id: users.value.activeUser._id,
									totalPages: chapter.pages.length,
									currentPage: chapter.pages.length,
									manga_id: reader.value.activeManga._id,
								},
							})
							.then(() => {
								getProgress()
							})
					} else {
						getProgress()
					}
				})
		}

		const continueReading = () => {
			let lastRead

			for (const c of reader.value.chapterList) {
				const progress = reader.value.readProgress.find(
					(p) => p.chapter_id == c._id
				)

				if (progress) {
					lastRead = c
				}
			}

			if (lastRead) {
				store.state.reader.activeChapter = lastRead
				router.push("/reader")
			} else {
				store.state.reader.activeChapter = reader.value.chapterList[0]
				router.push("/reader")
			}
		}

		const downloadMore = () => {
			store.dispatch("getMangaDetail", true)

			router.push("/downloader/true")
		}

		watch(
			() => reader.value.activeManga,
			() => {
				getChapters()
			}
		)

		return {
			app,
			reader,
			users,
			coverDirectory,
			readChapter,
			chapterProgress,
			markAsUnread,
			markAsRead,
			continueReading,
			downloadMore,
			totalProgress,
		}
	},
}
</script>

<style lang="scss">
@media all and (min-width: 900px) {
	#header {
		height: 300px;
		grid-template-areas:
			"c i"
			"d i" !important;
	}
	#body {
		overflow: auto;
	}
}

@media all and (max-width: 700px) {
	#mangaChapterSelection {
		overflow: auto;
		left: 73px !important;
		width: calc(100% - 73px) !important;
	}
	#header {
		overflow: inherit;
		height: auto !important;

		grid-template-areas:
			"i"
			"c"
			"d" !important;
	}

	#body {
		overflow: inherit !important;
		height: auto !important;
	}
}

#mangaChapterSelection {
	position: absolute;
	top: 51px;
	left: 201px;
	width: calc(100% - 201px);
	height: calc(100% - 51px);
	background-color: rgba(255, 255, 255, 0.3);
	transition: width 0.6s ease, left 0.6s ease;

	#header {
		height: 310px;
		overflow: auto;
		background-color: rgba(255, 255, 255, 0.3);
		display: grid;
		justify-items: center;
		grid-template-areas:
			"c i"
			"d d";

		#generalContent,
		#description {
			h1 {
				text-align: center;
				font-weight: lighter;
				font-size: 40px;
			}
			p {
				text-align: center;
				font-weight: lighter;
				font-size: 17px;
				label {
					font-weight: bold;
				}
			}
		}

		#generalContent {
			grid-area: c;
		}

		#description {
			grid-area: d;
			max-width: 600px;
			margin: 15px auto;
		}

		img {
			grid-area: i;
			width: 200px;
			height: 310px;
		}
	}

	#body {
		margin-top: 1px;
		height: calc(100% - 311px);
		overflow: hidden;

		#mangaMenu {
			height: 50px;
			width: 100%;
			background-color: rgba(255, 255, 255, 0.3);
			margin-bottom: 1px;
			position: relative;

			#totalProgress {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				z-index: -1;
				#progress {
					height: 100%;
					background-color: green;
					transition: width 0.6s ease;
				}
			}
			p {
				position: absolute;
				top: 0;
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				pointer-events: none;
			}

			button {
				height: 50px;
				width: 50px;
				background: none;
				border: none;
				padding: 10px;
				cursor: pointer;
				transition: background-color 0.6s ease;

				img {
					width: 100%;
					height: 100%;
				}

				&:hover {
					background-color: rgba(255, 255, 255, 0.3) !important;
				}
			}
		}
		#chaptersTable {
			overflow: auto;
			height: calc(100% - 50px);
			table {
				width: 100%;
				background-color: rgba(255, 255, 255, 0.3);

				tbody {
					tr {
						height: 40px;
						transition: background-color 0.6s ease;
						cursor: pointer;
						background-color: rgba(255, 255, 255, 0.3);
						&:nth-child(even) {
							background-color: inherit;
						}

						&:hover {
							background-color: rgba(255, 255, 255, 0.6);
						}

						td {
							text-align: center;
							img {
								width: 40px;
							}
						}
					}
				}
			}
		}
	}
}
</style>
