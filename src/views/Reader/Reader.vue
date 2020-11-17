<template>
	<div
		id="reader"
		:style="[
			{ backgroundImage: imgDirectory() },
			state.toggleZoom ? { cursor: 'zoom-in' } : {},
		]"
		@mousemove="setMousePos($event)"
		@click.right="state.toggleZoom = !state.toggleZoom"
		@wheel="changeZoomFactor($event)"
	>
		<div id="zoomWindow" :style="windowPosition">
			<div :style="[{ backgroundImage: imgDirectory() }, zoomPosition()]"></div>
		</div>
	</div>
</template>

<script>
const { ipcRenderer } = require("electron")

import { reactive, computed, watch, onBeforeUnmount, onMounted } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"

import path from "path"

export default {
	name: "Reader",

	setup() {
		const store = useStore()
		const router = useRouter()
		const state = reactive({
			currentPage: 0,
			toggleZoom: false,
			zoomWidth: 0,
			zoomHeight: 0,
			mouse: {
				x: 0,
				y: 0,
				zoomFactor: 2,
			},
			zoomWindow: {},
		})

		const reader = computed(() => store.state.reader)
		const users = computed(() => store.state.users)
		const app = computed(() => store.state.app)

		const windowPosition = computed(() => {
			let res = {}
			if (state.toggleZoom) {
				res = {
					top: `${state.mouse.y - state.zoomWindow.offsetHeight / 2}px`,
					left: `${state.mouse.x - state.zoomWindow.offsetWidth / 2}px`,
				}
			} else {
				res = {
					top: `-100vh`,
					left: `-100vw`,
				}
			}

			return res
		})

		const setMousePos = (e) => {
			state.mouse.x = e.pageX
			state.mouse.y = e.pageY
		}

		const changeZoomFactor = (e) => {
			let delta = e.deltaY

			if (delta > 0) {
				if (state.mouse.zoomFactor - 1 >= 2) {
					state.mouse.zoomFactor--
				}
			} else {
				state.mouse.zoomFactor++
			}
		}

		const zoomPosition = () => {
			if (state.toggleZoom) {
				let width = state.zoomWindow.offsetWidth
				let height = state.zoomWindow.offsetHeight
				let pos = {
					top: `${state.mouse.y * state.mouse.zoomFactor * -1 + height / 2}px`,
					left: `${state.mouse.x * state.mouse.zoomFactor * -1 + width / 2}px`,
					width: `${state.mouse.zoomFactor}00vw`,
					height: ` ${state.mouse.zoomFactor}00vh`,
				}

				return pos
			}
		}

		const changeTitle = () => {
			ipcRenderer.send(
				"change_window_title",
				`| ${reader.value.activeManga.name} - Capítulo ${
					reader.value.activeChapter.number
				} - Página ${state.currentPage + 1}/${
					reader.value.activeChapter.pages.length
				}`
			)
		}

		const imgDirectory = () => {
			let directory = ""

			if (reader.value.activeManga._id != undefined) {
				const filterFolderName = reader.value.activeManga.name.replace(":", "-")

				directory = `url('file:///${encodeURI(
					path.join(
						app.value.folder,
						"mangas",
						filterFolderName,
						String(reader.value.activeChapter.number),
						reader.value.activeChapter.pages[state.currentPage]
					)
				)}')`
			}
			directory = directory.replace(/\\/g, "/")

			return directory
		}

		const handleKeys = (e) => {
			const keys = {
				ArrowLeft: () => {
					if (!users.value.activeUser.reverse) {
						changePage(-1)
					} else {
						changePage(1)
					}
				},

				ArrowRight: () => {
					if (!users.value.activeUser.reverse) {
						changePage(1)
					} else {
						changePage(-1)
					}
				},

				Escape: () => {
					router.push("/")
				},
			}

			if (keys[e.key]) {
				keys[e.key]()
			}
		}

		const changePage = async (factor) => {
			if (
				factor + state.currentPage >= 0 &&
				factor + state.currentPage <=
					reader.value.activeChapter.pages.length - 1
			) {
				state.currentPage += factor

				const writeData = {
					manga_id: reader.value.activeManga._id,
					chapter_id: reader.value.activeChapter._id,
					user_id: users.value.activeUser._id,
					totalPages: reader.value.activeChapter.pages.length,
					currentPage: state.currentPage + 1,
				}

				let exist = await ipcRenderer.invoke("db-update", {
					table: "ReadProgress",
					query: { chapter_id: reader.value.activeChapter._id },
					data: writeData,
				})

				if (exist === 0) {
					exist = await ipcRenderer.invoke("db-insert", {
						table: "ReadProgress",
						data: writeData,
					})
				}

				store.dispatch("getProgress")
			} else {
				if (factor + state.currentPage < 0) {
					const currentChapterIndex = reader.value.chapterList.findIndex(
						(chapter) => chapter._id == reader.value.activeChapter._id
					)

					if (currentChapterIndex > 0) {
						reader.value.activeChapter =
							reader.value.chapterList[currentChapterIndex - 1]

						state.currentPage = reader.value.activeChapter.pages.length - 1
					} else {
						router.push("/")
					}
				}

				if (
					factor + state.currentPage >
					reader.value.activeChapter.pages.length - 1
				) {
					const currentChapterIndex = reader.value.chapterList.findIndex(
						(chapter) => chapter._id == reader.value.activeChapter._id
					)

					if (currentChapterIndex != reader.value.chapterList.length - 1) {
						if (currentChapterIndex < reader.value.chapterList.length - 1) {
							reader.value.activeChapter =
								reader.value.chapterList[currentChapterIndex + 1]
							state.currentPage = 0
						}
					} else {
						router.push("/")
					}
				}
			}
		}

		changeTitle()

		const currentProgress = reader.value.readProgress.find(
			(progress) => progress.chapter_id == reader.value.activeChapter._id
		)

		if (currentProgress) {
			state.currentPage = currentProgress.currentPage - 1
		}

		watch(
			() => state.currentPage,
			() => {
				changeTitle()
			}
		)

		onMounted(() => {
			window.addEventListener("keydown", handleKeys)
			state.zoomWindow = document.getElementById("zoomWindow")
		})

		onBeforeUnmount(() => {
			window.removeEventListener("keydown", handleKeys)
		})

		return {
			state,
			reader,
			app,
			users,
			windowPosition,
			setMousePos,
			changeZoomFactor,
			zoomPosition,
			imgDirectory,
		}
	},
}
</script>

<style lang="scss">
#reader {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-repeat: no-repeat;
	background-size: contain;
	background-position: center;

	#zoomWindow {
		width: 40vh;
		height: 40vh;
		box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);
		position: absolute;

		overflow: hidden;
		div {
			position: absolute;
			background-size: contain;
			background-repeat: no-repeat;
			background-position: center;
		}
	}
}
</style>
