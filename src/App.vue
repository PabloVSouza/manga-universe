<template>
	<div id="app">
		<div
			class="wallpaper"
			:style="{
				backgroundImage: getWallpaper,
				backgroundSize: getWallpaperMode,
			}"
		></div>
		<div class="content">
			<transition name="fade">
				<div id="loading" v-if="store.state.loading.active">
					<div
						id="loadingMessage"
						v-if="store.state.loading.message.length > 0"
					>
						<h1>{{ store.state.loading.message }}</h1>
						<img src="@/assets/loading.gif" alt="loading" />
						<div id="progressBar">
							<p>{{ getProgress }}%</p>
							<div id="progress" :style="{ width: `${getProgress}%` }"></div>
						</div>
					</div>
					<img
						v-else
						src="@/assets/loading.gif"
						alt="loading"
						id="loadingImage"
					/>
				</div>
			</transition>
			<router-view v-slot="{ Component }">
				<transition name="fade">
					<component :is="Component" />
				</transition>
			</router-view>
		</div>
	</div>
</template>

<script>
import { ipcRenderer } from "electron"

import { computed } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"

import path from "path"

export default {
	name: "App",
	setup() {
		const store = useStore()
		const router = useRouter()

		router.push("/")

		const getWallpaper = computed(() => {
			let response = ""
			if (
				store.state.app.wallpaper.active != "" &&
				store.state.app.folder != ""
			) {
				response = `url('file:///${encodeURI(
					path.join(
						store.state.app.folder,
						"wallpaper",
						store.state.app.wallpaper.active
					)
				)}')`
				response = response.replace(/\\/g, "/")
			} else {
				response = `url("${require("@/assets/wallpaper.jpg")}")`
			}

			return response
		})

		const getWallpaperMode = computed(() => store.state.app.wallpaper.mode)

		const getProgress = computed(() => {
			const current = store.state.loading.progress.current
			const total = store.state.loading.progress.total

			const percentage = (100 / total) * current

			return Math.round(percentage)
		})

		store.dispatch("setupIpc")
		ipcRenderer.send("check_url")

		return {
			getWallpaper,
			getWallpaperMode,
			store,
			getProgress,
		}
	},
}
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s ease !important;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0 !important;
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: "Roboto";
	&::-webkit-scrollbar-track {
		background-color: rgba(255, 255, 255, 0.3);
	}
	&::-webkit-scrollbar {
		width: 4px;
		background-color: rgba(255, 255, 255, 0.3);
	}
	&::-webkit-scrollbar-thumb {
		background-color: rgba(31, 25, 25, 0.685);
	}
	outline: none;
}

.noSelect {
	-webkit-touch-callout: none; /* iOS Safari */
	-webkit-user-select: none; /* Safari */
	-khtml-user-select: none; /* Konqueror HTML */
	-moz-user-select: none; /* Old versions of Firefox */
	-ms-user-select: none; /* Internet Explorer/Edge */
	user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
#app {
	height: 100vh;
	width: 100vw;
	.wallpaper,
	.content {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100%;
	}
	.wallpaper {
		background-repeat: no-repeat;
	}
	.content {
		z-index: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;

		.generalWindow {
			position: absolute;
			width: calc(100% - 40px);
			height: calc(100% - 40px);
			background-color: rgba(255, 255, 255, 0.3);
			border-radius: 5px;
			overflow: hidden;
			margin: 0 auto;
			box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);
			backdrop-filter: blur(4px);
			transition: background-color 0.6s ease;
		}
	}

	.closeButton {
		position: absolute;
		top: 0;
		left: 0;
		width: 40px;
		height: 40px;
		border: none;
		background-color: rgba(255, 255, 255, 0.3);
		padding: 5px;
		font-size: 20px;
		font-weight: lighter;
		cursor: pointer;
		transition: background-color 0.6s ease;
		border-bottom-right-radius: 5px;

		&:hover {
			background-color: rgba(255, 255, 255, 0.6);
		}
	}

	#loading {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.4);
		top: 0;
		left: 0;
		border-radius: 5px;
		z-index: 99;
		display: flex;
		justify-content: center;
		align-items: center;

		#loadingImage {
			width: 150px;
			height: 150px;
		}

		#loadingMessage {
			width: 300px;
			height: 300px;
			background-color: rgba(255, 255, 255, 0.9);
			border-radius: 5px;
			padding: 10px;
			display: grid;
			justify-items: center;

			grid-template-areas:
				"h"
				"i"
				"p"
				"p";
			h1 {
				text-align: center;
				font-size: 30px;
				height: 70px;
				font-weight: lighter;
				grid-area: "h";
			}

			img {
				grid-area: "i";
				padding: 10px;
				height: 140px;
			}

			#progressBar {
				background-color: rgba(0, 0, 0, 0.3);
				width: 100%;
				height: 50px;
				border-radius: 5px;
				overflow: hidden;
				box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);
				position: relative;
				grid-area: "p";
				p {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 100%;
					width: 100%;
					position: absolute;
				}

				#progress {
					height: 100%;
					background-color: rgb(55, 167, 55);
				}
			}
		}
	}
}
</style>
