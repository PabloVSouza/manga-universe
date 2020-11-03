<template>
	<div id="Wallpaper" class="generalWindow">
		<div id="content">
			<button class="closeButton" @click.prevent="$router.push('/')">X</button>
			<h1>{{ $lang.Wallpaper.headerText }}</h1>
			<div id="wallpaperMode">
				<label for="wallpaperMode-selector">
					{{ $lang.Wallpaper.labelMode }}:
				</label>
				<select v-model="state.app.wallpaper.mode" id="wallpaperMode-selector">
					<option value="cover">Cover</option>
					<option value="contain">Contain</option>
					<option value="auto">Auto</option>
					<option value="100% 100%">100% 100%</option>
				</select>
			</div>
			<div id="wallpaperList">
				<div class="imgWallpaper">
					<input
						type="file"
						id="upload"
						@change="processFile"
						accept=".jpg, .jpeg, .png, .gif, .svg"
					/>
					<label for="upload">
						<img src="@/assets/upload.svg" alt="upload" />
					</label>
					<p>{{ $lang.Wallpaper.btnNewWallpaper }}</p>
				</div>
				<div
					:class="[
						'imgWallpaper',
						state.app.wallpaper.active == '' ? 'active' : '',
					]"
					@click="state.app.wallpaper.active = ''"
				>
					<img src="@/assets/wallpaper.jpg" alt="wallpaper" />
					<p>{{ $lang.Wallpaper.btnDefaultWallpaper }}</p>
				</div>
				<div
					:class="[
						'imgWallpaper',
						wallpaper == state.app.wallpaper.active ? 'active' : '',
					]"
					v-for="(wallpaper, key) in state.app.wallpaper.list"
					:key="key"
					@click="state.app.wallpaper.active = wallpaper"
				>
					<img :src="`file:///${imgPath(wallpaper)}`" alt="wallpaper" />
					<p>{{ wallpaper }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { ipcRenderer } from "electron"

import { reactive, watch, computed } from "vue"
import { useStore } from "vuex"

import path from "path"

export default {
	name: "Wallpaper",
	setup() {
		const store = useStore()

		const state = reactive({
			app: store.state.app,
			file: "",
		})

		const activeWallpaper = computed(() => {
			return store.state.app.wallpaper.active
		})

		const imgPath = (img) => {
			return encodeURI(path.join(state.app.folder, "wallpaper", img))
		}

		const processFile = (e) => {
			ipcRenderer.send("new_wallpaper", e.target.files[0].path)
		}

		watch(
			() => [state.app.wallpaper.active, state.app.wallpaper.mode],
			() => {
				ipcRenderer.send(
					"write_wallpaper_settings",
					JSON.stringify(state.app.wallpaper)
				)
			}
		)

		return { state, imgPath, activeWallpaper, processFile }
	},
}
</script>

<style lang="scss">
#Wallpaper {
	padding: 50px 20px;
	background-color: rgba(255, 255, 255, 0.6) !important;
	#content {
		height: 100%;
		overflow: auto;
		h1 {
			height: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: lighter;
		}

		#wallpaperMode {
			text-align: center;
			margin-bottom: 20px;
			label {
				margin-right: 10px;
				font-size: 20px;
			}
			#wallpaperMode-selector {
				width: 150px;
				font-size: 20px;
				border: none;
				background: none;
				cursor: pointer;
				transition: background-color 0.6s ease;
				&:hover {
					background-color: rgba(255, 255, 255, 0.9);
				}

				option {
					border: none;
					background: none;
				}
			}
		}

		#wallpaperList {
			display: flex;
			flex-wrap: wrap;
			.imgWallpaper {
				height: 150px;
				width: 200px;
				margin: 15px;
				border-radius: 5px;
				overflow: hidden;
				text-align: center;
				transition: background-color 0.6s ease;
				display: flex;
				flex-direction: column;
				cursor: pointer;
				label img,
				img {
					border-radius: 5px;
					width: 100%;
					height: 113px;
					cursor: pointer;
				}

				p {
					display: flex;
					height: calc(100% - 113px);
					align-items: center;
					justify-content: center;
					word-break: break-all;
				}

				&:hover {
					background-color: rgba(0, 0, 0, 0.1);
				}

				input {
					display: none;
				}
			}
		}
	}
}
.active {
	background-color: rgba(0, 0, 0, 0.3) !important;
}
</style>
