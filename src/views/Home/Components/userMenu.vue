<template>
	<div id="userMenu">
		<h1>{{ state.users.activeUser.name }}</h1>
		<ul>
			<li>
				{{ $lang.Home.userMenu.btnReverseKeys }}:
				<input type="checkbox" v-model="state.users.activeUser.reverse" />
			</li>
			<li @click="changeUser()">{{ $lang.Home.userMenu.btnChangeUser }}</li>
		</ul>
	</div>
</template>

<script>
const { ipcRenderer } = require("electron")

import { reactive, watch, onMounted, onBeforeUnmount } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"

export default {
	name: "userMenu",

	setup() {
		const store = useStore()
		const router = useRouter()

		const state = reactive({
			users: store.state.users,
			reverseButton: store.state.users.activeUser.reverse,
		})

		const changeUser = () => {
			state.users.activeUser = {}
			state.users.userMenu = false
			router.push("/users")
		}

		const handleClick = (e) => {
			if (
				document.getElementById("userMenu").contains(e.target) ||
				document.getElementById("btnUser").contains(e.target)
			) {
				//Não faz nada
			} else {
				state.users.userMenu = false
			}
		}

		const updateUser = () => {
			ipcRenderer.send("update_user", this.users.activeUser)
		}

		watch(
			() => state.reverseButton,
			() => {
				updateUser()
			}
		)

		onMounted(() => {
			window.addEventListener("click", handleClick)
		})

		onBeforeUnmount(() => {
			window.removeEventListener("click", handleClick)
		})

		return {
			state,
			changeUser,
			updateUser,
		}
	},
}
</script>

<style lang="scss">
#userMenu {
	width: 200px;
	background-color: rgba(180, 180, 180, 0.9);
	z-index: 1;
	position: absolute;
	top: 50px;
	right: 0;
	box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);

	h1 {
		text-align: center;
		font-weight: lighter;
		background-color: rgba(255, 255, 255, 0.6);
	}

	ul {
		width: 200px;

		list-style-type: none;
		margin: 0;
		padding: 0;
		margin-top: 1px;
		li {
			cursor: pointer;
			height: 40px;
			margin-bottom: 1px;
			display: flex;
			justify-content: center;
			align-items: center;
			transition: background-color 0.6s ease;
			background-color: rgba(255, 255, 255, 0.5);

			input[type="checkbox"] {
				width: 20px;
				height: 20px;
				margin-left: 15px;
				cursor: pointer;
			}

			&:hover {
				background-color: rgba(255, 255, 255, 0.9);
			}
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
}
</style>
