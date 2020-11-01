<template>
	<div id="topMenu" class="noSelect">
		<div id="buttonGroupLeft">
			<button
				@click.prevent="$router.push('/downloader')"
				:title="$lang.Home.topMenu.titleDownloadMangas"
			>
				<img src="@/assets/download-icon.svg" alt="download" />
			</button>
		</div>
		<div id="buttonGroupRight">
			<button
				id="btnUser"
				@click.prevent="state.users.userMenu = !state.users.userMenu"
				:style="styleBtn"
				:title="$lang.Home.topMenu.titleUserMenu"
			>
				<img src="@/assets/user-profile.svg" alt="user" />
			</button>
		</div>
	</div>
</template>

<script>
import { reactive, computed } from "vue"
import { useStore } from "vuex"

export default {
	name: "topMenu",

	setup() {
		const store = useStore()

		const state = reactive({
			users: store.state.users,
		})

		const styleBtn = computed(() => {
			let style = {}
			if (state.users.userMenu) {
				style.backgroundColor = "rgba(255,255,255,0.3)"
			}
			return style
		})

		return {
			state,
			styleBtn,
		}
	},
}
</script>

<style lang="scss">
#topMenu {
	width: 100%;
	height: 50px;
	background-color: rgba(255, 255, 255, 0.3);
	position: absolute;
	padding: 5px;

	#buttonGroupLeft,
	#buttonGroupRight {
		height: 100%;
		position: absolute;
		top: 0;
		button {
			height: 100%;
			background: none;
			border: none;
			cursor: pointer;
			transition: background-color 0.6s ease;
			padding: 5px;

			&:hover {
				background-color: rgba(255, 255, 255, 0.3) !important;
			}
			img {
				height: 100%;
			}
		}
	}

	#buttonGroupLeft {
		left: 0px;
	}

	#buttonGroupRight {
		right: 0px;
	}
}
</style>
