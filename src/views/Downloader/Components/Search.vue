<template>
	<div id="Search">
		<div id="topBar">
			<input
				type="text"
				:placeholder="$lang.Downloader.textPlaceholder"
				v-model="state.searchTerms"
				@input="state.isTyping = true"
			/>
		</div>
		<div id="searchResult">
			<div
				class="manga"
				v-for="(manga, key) in downloader.mangaList"
				:key="key"
				@click="getManga(manga)"
			>
				<div class="capa">
					<img :src="manga.cover" :alt="manga.name" />
				</div>
				<div class="info">
					<h1>{{ manga.name }}</h1>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
const { ipcRenderer } = require("electron")

import { reactive, computed, watch } from "vue"
import { useStore } from "vuex"

import _ from "lodash"

export default {
	name: "Search",
	props: ["downloadMore"],
	setup(props) {
		const store = useStore()

		const state = reactive({
			searchTerms: "",
			isTyping: false,
			downloadMore: props.downloadMore,
		})

		const downloader = computed(() => store.state.downloader)

		const searchMangas = () => {
			if (state.searchTerms.trim().length > 0) {
				ipcRenderer.invoke("search_manga", state.searchTerms).then((res) => {
					downloader.value.mangaList = res
				})
			}
		}

		const getManga = (
			manga = JSON.parse(JSON.stringify(store.state.reader.activeManga))
		) => {
			store.state.loading.active = true
			if (!state.downloadMore) {
				downloader.value.activeManga = JSON.parse(JSON.stringify(manga))
				ipcRenderer
					.invoke(
						"get_manga_description",
						JSON.parse(JSON.stringify(downloader.value.activeManga))
					)
					.then((description) => {
						downloader.value.activeManga.description = description
						ipcRenderer
							.invoke("get_chapters", JSON.parse(JSON.stringify(manga)))
							.then((chapters) => {
								downloader.value.activeManga.chapters = chapters
								downloader.value.activeComponent = "Detail"
								store.state.loading.active = false
							})
					})
			} else {
				ipcRenderer
					.invoke("get_chapters", JSON.parse(JSON.stringify(manga)))
					.then((chapters) => {
						downloader.value.activeManga.chapters = chapters
						downloader.value.activeComponent = "Detail"
						store.state.loading.active = false
					})
			}
		}

		if (state.downloadMore) {
			getManga()
		}

		watch(
			() => state.searchTerms,
			_.debounce(() => {
				state.isTyping = false
			}, 1000)
		)

		watch(
			() => state.isTyping,
			(value) => {
				if (!value) {
					searchMangas()
				}
			}
		)

		return {
			state,
			downloader,
			searchMangas,
			getManga,
		}
	},
}
</script>

<style lang="scss">
#Search {
	height: calc(100% - 90px);
	width: calc(100% - 90px);
	position: absolute;
	#topBar {
		display: flex;
		height: 50px;
		margin: 10px 0;

		input[type="text"] {
			width: 100%;
			border: none;
			background-color: rgba(255, 255, 255, 0.6);
			border-radius: 5px;
			padding: 0 20px;
			font-size: 18px;
			box-shadow: 2px 6px 16px -5px rgba(0, 0, 0, 0.75);
			background-image: url("../../../assets/magnifying-glass-search.svg");
			background-repeat: no-repeat;
			background-position: right;
			background-origin: content-box;
			background-size: 30px;
		}
	}

	#searchResult {
		overflow: auto;
		max-height: calc(100% - 60px);
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		.manga {
			width: 170px;
			text-align: center;
			background-color: rgba(255, 255, 255, 0.3);
			border-radius: 5px;
			margin: 5px;
			padding: 10px;
			cursor: pointer;
			box-shadow: 2px 6px 16px -5px rgba(0, 0, 0, 0.75);
			max-height: 400px;
			transition: background-color 0.6s ease;

			&:hover {
				background-color: rgba(255, 255, 255, 0.6);
			}

			.capa {
				height: 200px;
				img {
					height: 100%;
					width: 100%;
				}
			}
			.info {
				margin-top: 5px;
				width: 100%;

				h1 {
					font-weight: lighter;
					font-size: 18px;
					text-align: center;
				}
			}
		}
	}
}
</style>
