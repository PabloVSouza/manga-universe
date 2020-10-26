<template>
	<div
		id="reader"
		:style="{ backgroundImage: imgDirectory() }"
		@mousemove="setMousePos($event)"
		@click.right="toggleZoom = !toggleZoom"
		@wheel="changeZoomFactor($event)"
	>
		<div id="zoomWindow" v-show="toggleZoom">
			<div :style="[{ backgroundImage: imgDirectory() }, zoomPosition()]"></div>
		</div>
	</div>
</template>

<script>
const { ipcRenderer } = require("electron")
import { mapState } from "vuex"

export default {
	data() {
		return {
			currentPage: 0,
			toggleZoom: false,
			zoomWidth: 0,
			zoomHeight: 0,
			mouse: {
				x: 0,
				y: 0,
				zoomFactor: 2,
			},
		}
	},

	computed: {
		...mapState(["reader", "users", "appFolder"]),
	},

	created() {
		this.changeTitle()
		window.addEventListener("keydown", this.handleKeys)

		const currentProgress = this.reader.readProgress.find(
			(progress) => progress.chapter_id == this.reader.activeChapter._id
		)

		if (currentProgress) {
			this.currentPage = currentProgress.currentPage - 1
		}
	},

	beforeDestroy() {
		window.removeEventListener("keydown", this.handleKeys)
	},

	methods: {
		setMousePos(e) {
			this.mouse.x = e.pageX
			this.mouse.y = e.pageY
		},

		changeZoomFactor(e) {
			let delta = e.deltaY
			if (delta == 100) {
				if (this.mouse.zoomFactor - 1 >= 1) {
					this.mouse.zoomFactor--
				}
			} else {
				this.mouse.zoomFactor++
			}
		},

		zoomPosition() {
			if (this.toggleZoom) {
				let pos = {
					top: `${this.mouse.y * this.mouse.zoomFactor * -1 + 175}px`,
					left: `${this.mouse.x * this.mouse.zoomFactor * -1 + 175}px`,
					width: `${this.mouse.zoomFactor}00vw`,
					height: ` ${this.mouse.zoomFactor}00vh`,
				}

				return pos
			}
		},

		changeTitle() {
			ipcRenderer.send(
				"change_window_title",
				`Manga Universe - ${this.reader.activeManga.name} - Capítulo ${
					this.reader.activeChapter.number
				} - Página ${this.currentPage + 1}/${
					this.reader.activeChapter.pages.length
				}`
			)
		},

		imgDirectory() {
			let directory = ""

			if (this.reader.activeManga._id != undefined) {
				const filterFolderName = this.reader.activeManga.name.replace(":", "-")

				directory = `url('file:///${
					this.appFolder
				}/mangas/${filterFolderName}/${this.reader.activeChapter.number}/${
					this.reader.activeChapter.pages[this.currentPage]
				}')`
			}
			directory = directory.replace(/\\/g, "/")

			return directory
		},

		handleKeys(key) {
			if (key.key == "ArrowLeft") {
				if (!this.users.activeUser.reverse) {
					this.changePage(-1)
				} else {
					this.changePage(1)
				}
			}
			if (key.key == "ArrowRight") {
				if (!this.users.activeUser.reverse) {
					this.changePage(1)
				} else {
					this.changePage(-1)
				}
			}
			if (key.key == "Escape") {
				this.$router.push("/")
			}
		},

		changePage(factor) {
			if (
				factor + this.currentPage >= 0 &&
				factor + this.currentPage <= this.reader.activeChapter.pages.length - 1
			) {
				this.currentPage += factor
				ipcRenderer.send("update_progress", {
					chapter_id: this.reader.activeChapter._id,
					user_id: this.users.activeUser._id,
					totalPages: this.reader.activeChapter.pages.length,
					currentPage: this.currentPage + 1,
				})
			} else {
				if (factor + this.currentPage < 0) {
					const currentChapterIndex = this.reader.chapterList.findIndex(
						(chapter) => chapter._id == this.reader.activeChapter._id
					)

					if (currentChapterIndex > 0) {
						this.reader.activeChapter = this.reader.chapterList[
							currentChapterIndex - 1
						]

						this.currentPage = this.reader.activeChapter.pages.length - 1
					} else {
						this.$router.push("/")
					}
				}

				if (
					factor + this.currentPage >
					this.reader.activeChapter.pages.length - 1
				) {
					const currentChapterIndex = this.reader.chapterList.findIndex(
						(chapter) => chapter._id == this.reader.activeChapter._id
					)

					if (currentChapterIndex != this.reader.chapterList.length - 1) {
						if (currentChapterIndex < this.reader.chapterList.length - 1) {
							this.reader.activeChapter = this.reader.chapterList[
								currentChapterIndex + 1
							]
							this.currentPage = 0
						}
					} else {
						this.$router.push("/")
					}
				}
			}
		},
	},
	watch: {
		currentPage() {
			this.changeTitle()
		},
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
	cursor: zoom-in;
	#zoomWindow {
		width: 350px;
		height: 350px;
		box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);
		position: absolute;
		top: 50px;
		right: 50px;
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
