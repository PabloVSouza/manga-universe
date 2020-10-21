<template>
	<div id="userMenu">
		<h1>{{ users.activeUser.name }}</h1>
		<ul>
			<li>
				Inverter teclas:
				<input type="checkbox" v-model="users.activeUser.reverse" />
			</li>
			<li @click="changeUser()">Trocar de Usuário</li>
		</ul>
	</div>
</template>

<script>
import { mapState } from "vuex"
const { ipcRenderer } = require("electron")

export default {
	computed: {
		...mapState(["users"]),
		reverseButton() {
			return this.users.activeUser.reverse
		},
	},

	created() {
		window.addEventListener("click", this.handleClick)
	},

	methods: {
		changeUser() {
			this.users.activeUser = {}
			this.users.userMenu = false
			this.$router.push("/users")
		},

		handleClick(e) {
			if (
				document.getElementById("userMenu").contains(e.target) ||
				document.getElementById("btnUser").contains(e.target)
			) {
				//Não faz nada
			} else {
				this.users.userMenu = false
			}
		},
		updateUser() {
			ipcRenderer.send("update_user", this.users.activeUser)
		},
	},

	beforeDestroy() {
		window.removeEventListener("click", this.handleClick)
	},

	watch: {
		reverseButton() {
			this.updateUser()
		},
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
