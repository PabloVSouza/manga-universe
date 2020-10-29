<template>
	<div id="Downloader">
		<button class="closeButton" @click.prevent="$router.push('/')">
			X
		</button>
		<transition name="fade">
			<Detail
				v-if="downloader.detail"
				@close-detail="closeDetail()"
				:downloadMore="downloadMore"
			/>
		</transition>

		<div id="topBar">
			<input
				type="text"
				:placeholder="$lang.Downloader.textPlaceholder"
				v-model="searchTerms"
				@input="isTyping = true"
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
import Detail from "./Components/Detail"
import _ from "lodash"
import { mapActions, mapState } from "vuex"
const { ipcRenderer } = require("electron")

export default {
	name: "Downloader",
	components: { Detail },

	data() {
		return {
			searchTerms: "",
			mangaDetail: false,
			isTyping: false,
		}
	},

	computed: {
		...mapState(["downloader"]),
		...mapActions(["getMangaDetail"]),
		downloadMore() {
			return this.$route.params.downloadMore
		},
	},

	methods: {
		searchMangas() {
			if (this.searchTerms.trim().length > 0) {
				ipcRenderer.send("search_manga", this.searchTerms)
			}
		},

		getManga(manga) {
			this.$store.state.downloader.activeManga = JSON.parse(
				JSON.stringify(manga)
			)
			this.$store.dispatch("getMangaDetail")
		},

		closeDetail() {
			if (this.downloadMore) {
				this.downloader.detail = false
				this.$router.push("/")
			} else {
				this.downloader.detail = false
			}
		},
	},

	watch: {
		searchTerms: _.debounce(function() {
			this.isTyping = false
		}, 1000),

		isTyping(value) {
			if (!value) {
				this.searchMangas()
			}
		},
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
