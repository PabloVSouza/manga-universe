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
			reader: store.state.reader,
			users: store.state.users,
			app: store.state.app,
		})

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
				`| ${state.reader.activeManga.name} - Capítulo ${
					state.reader.activeChapter.number
				} - Página ${state.currentPage + 1}/${
					state.reader.activeChapter.pages.length
				}`
			)
		}

		const imgDirectory = () => {
			let directory = ""

			if (state.reader.activeManga._id != undefined) {
				const filterFolderName = state.reader.activeManga.name.replace(":", "-")

				directory = `url('file:///${encodeURI(
					path.join(
						state.app.Folder,
						"mangas",
						filterFolderName,
						String(state.reader.activeChapter.number),
						state.reader.activeChapter.pages[state.currentPage]
					)
				)}')`
			}
			directory = directory.replace(/\\/g, "/")

			return directory
		}

		const handleKeys = (key) => {
			if (key.key == "ArrowLeft") {
				if (!state.users.activeUser.reverse) {
					changePage(-1)
				} else {
					changePage(1)
				}
			}
			if (key.key == "ArrowRight") {
				if (!state.users.activeUser.reverse) {
					changePage(1)
				} else {
					changePage(-1)
				}
			}
			if (key.key == "Escape") {
				router.push("/")
			}
		}

		const changePage = (factor) => {
			if (
				factor + state.currentPage >= 0 &&
				factor + state.currentPage <=
					state.reader.activeChapter.pages.length - 1
			) {
				state.currentPage += factor
				ipcRenderer.send("update_progress", {
					chapter_id: state.reader.activeChapter._id,
					user_id: state.users.activeUser._id,
					totalPages: state.reader.activeChapter.pages.length,
					currentPage: state.currentPage + 1,
				})
			} else {
				if (factor + state.currentPage < 0) {
					const currentChapterIndex = state.reader.chapterList.findIndex(
						(chapter) => chapter._id == state.reader.activeChapter._id
					)

					if (currentChapterIndex > 0) {
						state.reader.activeChapter =
							state.reader.chapterList[currentChapterIndex - 1]

						state.currentPage = state.reader.activeChapter.pages.length - 1
					} else {
						router.push("/")
					}
				}

				if (
					factor + state.currentPage >
					state.reader.activeChapter.pages.length - 1
				) {
					const currentChapterIndex = state.reader.chapterList.findIndex(
						(chapter) => chapter._id == state.reader.activeChapter._id
					)

					if (currentChapterIndex != state.reader.chapterList.length - 1) {
						if (currentChapterIndex < state.reader.chapterList.length - 1) {
							state.reader.activeChapter =
								state.reader.chapterList[currentChapterIndex + 1]
							state.currentPage = 0
						}
					} else {
						router.push("/")
					}
				}
			}
		}

		changeTitle()

		const currentProgress = state.reader.readProgress.find(
			(progress) => progress.chapter_id == state.reader.activeChapter._id
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
