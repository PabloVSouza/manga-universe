<template>
	<div id="Downloader">
		<button class="closeButton" @click.prevent="$router.push('/')">
			X
		</button>
		<transition name="fade">
			<Detail
				v-if="state.downloader.detail"
				@close-detail="closeDetail()"
				:downloadMore="state.downloadMore"
			/>
		</transition>

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
import _ from "lodash"
const { ipcRenderer } = require("electron")
import Detail from "./Components/Detail"
import { useStore } from "vuex"
import { useRoute, useRouter } from "vue-router"
import { reactive, watch } from "vue"

export default {
	name: "Downloader",
	components: { Detail },

	setup() {
		const store = useStore()
		const route = useRoute()
		const router = useRouter()

		const state = reactive({
			searchTerms: "",
			mangaDetail: false,
			isTyping: false,
			downloader: store.state.downloader,
			downloadMore: route.params.downloadMore,
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

		const closeDetail = () => {
			if (state.downloadMore) {
				state.downloader.detail = false
				router.push("/")
			} else {
				state.downloader.detail = false
			}
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
			closeDetail,
		}
	},
}
</script>

<style lang="scss">
#Downloader {
	position: relative;
	margin: 0 auto;
	height: 100%;
	width: 100%;
	background-color: rgba(255, 255, 255, 0.3);
	border-radius: 5px;
	padding: 45px;
	padding-bottom: 15px;
	box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);
	z-index: 1;
	overflow: hidden;

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
			background-image: url("../../assets/magnifying-glass-search.svg");
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
			background-color: rgba(255, 255, 255, 0.6);
			border-radius: 5px;
			margin: 5px;
			padding: 10px;
			cursor: pointer;
			box-shadow: 2px 6px 16px -5px rgba(0, 0, 0, 0.75);
			max-height: 400px;

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
