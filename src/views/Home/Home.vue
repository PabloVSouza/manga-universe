<template>
	<div id="Home" class="generalWindow">
		<topMenu />
		<template v-if="reader.mangaList.length > 0">
			<mangaList />
			<mangaChapterSelection />
		</template>
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

import { reactive } from "vue"
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
			reader: store.state.reader,
			users: store.state.users,
		})

		if (state.users.activeUser._id == undefined) {
			router.push("/users")
		}

		ipcRenderer.send("change_window_title", ``)

		return state
	},
}
</script>

<style lang="scss"></style>
