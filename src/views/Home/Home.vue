<template>
	<div id="Home" class="generalWindow">
		<topMenu />
		<mangaList />
		<mangaChapterSelection />
		<transition name="fade">
			<userMenu v-if="users.userMenu" />
		</transition>
	</div>
</template>

<script>
import { ipcRenderer } from "electron"

import topMenu from "./Components/topMenu"
import mangaList from "./Components/mangaList"
import mangaChapterSelection from "./Components/mangaChapterSelection"
import userMenu from "./Components/userMenu"

import { reactive, computed } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"

export default {
	name: "Home",
	components: {
		topMenu,
		mangaList,
		mangaChapterSelection,
		userMenu,
	},

	setup() {
		const store = useStore()
		const router = useRouter()
		const state = reactive({
			showDownloader: false,
		})

		const users = computed(() => store.state.users)
		const reader = computed(() => store.state.reader)

		if (users.value.activeUser._id == undefined) {
			router.push("/users")
		}

		ipcRenderer.send("change_window_title", ``)

		return {
			state,
			users,
			reader,
		}
	},
}
</script>

<style lang="scss"></style>
