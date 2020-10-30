<template>
	<div id="Home">
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
import topMenu from "./Components/topMenu"
import mangaList from "./Components/mangaList"
import mangaChapterSelection from "./Components/mangaChapterSelection"
import userMenu from "./Components/userMenu"
import { reactive } from "vue"
import { useStore } from "vuex"
import { ipcRenderer } from "electron"

export default {
	name: "Home",
	components: {
		topMenu,
		mangaList,
		mangaChapterSelection,
		userMenu,
	},

	created() {
		if (this.users.activeUser._id == undefined) {
			this.$router.push("/users")
		}

		ipcRenderer.send("change_window_title", ``)
	},

	setup() {
		const store = useStore()

		const state = reactive({
			showDownloader: false,
			reader: store.state.reader,
			users: store.state.users,
		})

		return state
	},
}
</script>

<style lang="scss">
#Home {
	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.3);
	border-radius: 5px;
	box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);
	overflow: hidden;
	position: relative;
}
</style>
