<template>
	<div id="mangaList">
		<ul>
			<li
				v-for="manga in state.mangaList"
				:key="manga._id"
				@click="selectManga(manga)"
				:class="manga._id == state.reader.activeManga._id ? 'activeManga' : ''"
				:title="manga.name"
			>
				<div class="mangaName">
					{{ manga.name }}
				</div>
				<div class="mangaCover">
					<img :src="coverDirectory(manga)" :alt="manga.name" />
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
import { ipcRenderer } from "electron"

import { reactive } from "vue"
import { useStore } from "vuex"

import path from "path"

export default {
	name: "mangaList",

	setup() {
		const store = useStore()
		const state = reactive({
			mangaList: [],
			reader: store.state.reader,
			app: store.state.app,
		})

		function getMangas() {
			ipcRenderer
				.invoke("find", {
					table: "Manga",
					query: {},
					sort: { createdAt: 1 },
				})
				.then((res) => {
					state.mangaList = res
					store.state.reader.activeManga = res[0]
				})
		}

		getMangas()

		const coverDirectory = (manga) => {
			const filterFolderName = manga.name.replace(":", "-")

			const directory = `file:///${encodeURI(
				path.join(state.app.folder, "mangas", filterFolderName, manga.cover)
			)}`

			return directory
		}

		const selectManga = (manga) => {
			store.state.reader.activeManga = manga
			ipcRenderer.send("get_available_chapters", state.reader.activeManga._id)
		}

		return {
			state,
			coverDirectory,
			selectManga,
		}
	},
}
</script>

<style lang="scss">
@media all and (max-width: 700px) {
	#mangaList {
		transform: translateX(-128px);
	}
}
.activeManga {
	background-color: rgba(255, 255, 255, 0.6) !important;
}

#mangaList {
	height: calc(100% - 51px);
	width: 200px;
	top: 51px;
	position: absolute;
	background-color: rgba(255, 255, 255, 0.3);
	overflow: auto;
	transition: transform 0.6s ease;

	ul {
		height: 100%;
		width: 100%;

		li {
			padding: 5px;
			display: flex;
			background-color: rgba(255, 255, 255, 0.3);
			margin-bottom: 1px;
			cursor: pointer;
			transition: background-color 0.6s ease;

			&:hover {
				background-color: rgba(255, 255, 255, 0.9) !important;
			}

			.mangaName {
				width: calc(100% - 62px);
				overflow: hidden;
				display: flex;

				align-items: center;
				padding: 3px;
			}

			.mangaCover {
				float: right;
				width: 62px;
				display: flex;
				justify-content: center;
				align-items: center;
				flex-direction: column;

				img {
					width: 100%;
				}
			}
		}
	}
}
</style>
