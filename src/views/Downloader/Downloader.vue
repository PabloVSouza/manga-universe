<template>
	<div
		id="Downloader"
		class="generalWindow"
		:style="
			downloader.activeComponent == 'Detail'
				? { backgroundColor: 'rgba(255,255,255,0.6)' }
				: {}
		"
	>
		<button class="closeButton" @click.prevent="closeDownloader()">
			X
		</button>
		<transition name="fade">
			<component
				:is="downloader.activeComponent"
				:downloadMore="state.downloadMore"
			/>
		</transition>
	</div>
</template>

<script>
import Detail from "./Components/Detail"
import Search from "./Components/Search"

import { reactive, computed } from "vue"
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
		})

		const downloader = computed(() => store.state.downloader)

		const closeDownloader = () => {
			if (downloader.value.activeComponent == "Detail") {
				if (!state.downloadMore) {
					downloader.value.activeComponent = "Search"
				} else {
					state.downloadMore = false
					downloader.value.activeComponent = "Search"
					router.push("/")
				}
			} else {
				router.push("/")
			}
		}

		return {
			state,
			closeDownloader,
			downloader,
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
