<template>
	<div id="app">
		<div
			class="wallpaper"
			:style="{
				backgroundImage: getWallpaper,
			}"
		></div>
		<div class="content">
			<transition name="fade">
				<div id="loading" v-if="loading.active">
					<div>
						<h1>{{ loading.loadingMessage }}</h1>
					</div>
				</div>
			</transition>
			<router-view />
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from "vuex"
const { ipcRenderer } = require("electron")

export default {
	computed: {
		...mapState(["loading", "users", "app"]),
		...mapActions(["setupIpc"]),

		getWallpaper() {
			let response = ""
			if (this.app.wallpaper != "") {
				response = `url('file:///${this.app.Folder}/${this.app.wallpaper}')`
				response = response.replace(/\\/g, "/")
			} else {
				response = `url("${require("@/assets/wallpaper.jpg")}")`
			}

			return response
		},
	},
	created() {
		this.$store.dispatch("setupIpc")
		ipcRenderer.send("check_url")
	},
}
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");
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
	width: 100%;
	.wallpaper,
	.content {
		position: fixed;
		top: 0;
		left: 0;
		height: 100vh;
		width: 100%;
	}
	.wallpaper {
		background-size: cover;
		background-repeat: no-repeat;
	}
	.content {
		z-index: 1;
		padding: 20px;
		display: flex;
		justify-content: center;
		align-items: center;
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
	.fade-enter-active,
	.fade-leave-active {
		transition: opacity 0.5s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
	}
	#loading {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.4);
		top: 0;
		left: 0;
		border-radius: 5px;
		background-image: url("assets/loading.gif");
		background-position: center;
		background-repeat: no-repeat;
		background-size: 70px;
		z-index: 99;

		h1 {
			background-color: white;
			text-align: center;
		}
	}
}
</style>
