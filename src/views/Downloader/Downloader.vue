<template>
	<div
		id="Downloader"
		class="generalWindow"
		:style="
			state.downloader.activeComponent == 'Detail'
				? { backgroundColor: 'rgba(255,255,255,0.6)' }
				: {}
		"
	>
		<button class="closeButton" @click.prevent="closeDownloader()">
			X
		</button>
		<transition name="fade">
			<component
				:is="$store.state.downloader.activeComponent"
				:downloadMore="state.downloadMore"
			/>
		</transition>
	</div>
</template>

<script>
import Detail from "./Components/Detail"
import Search from "./Components/Search"

import { reactive } from "vue"
import { useStore } from "vuex"
import { useRoute, useRouter } from "vue-router"

export default {
	name: "Downloader",
	components: { Search, Detail },

	setup() {
		const store = useStore()
		const route = useRoute()
		const router = useRouter()

		const state = reactive({
			downloadMore: route.params.downloadMore,
			downloader: store.state.downloader,
		})

		const closeDownloader = () => {
			if (store.state.downloader.activeComponent == "Detail") {
				store.state.downloader.activeComponent = "Search"
				if (state.downloadMore) {
					router.push("/")
				}
			} else {
				router.push("/")
			}
		}

		return {
			state,
			closeDownloader,
		}
	},
}
</script>

<style lang="scss">
#Downloader {
	padding-bottom: 15px;
	padding: 45px;
}
</style>
