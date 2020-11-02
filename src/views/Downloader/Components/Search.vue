<template>
	<div id="Search" v-if="!state.downloader.detail">
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
				v-for="(manga, key) in state.downloader.mangaList"
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

import { reactive, watch } from "vue"
import { useStore } from "vuex"

import _ from "lodash"

export default {
	name: "Search",
	setup() {
		const store = useStore()

		const state = reactive({
			searchTerms: "",
			mangaDetail: false,
			isTyping: false,
			downloader: store.state.downloader,
		})

		const searchMangas = () => {
			if (state.searchTerms.trim().length > 0) {
				ipcRenderer.send("search_manga", state.searchTerms)
			}
		}

		const getManga = (manga) => {
			state.downloader.activeManga = JSON.parse(JSON.stringify(manga))
			store.dispatch("getMangaDetail")
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
		height: calc(100% - 60px);
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
