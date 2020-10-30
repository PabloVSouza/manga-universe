<template>
	<div id="Users">
		<CreateUser v-if="state.users.createUser" :editUser="state.userEdit" />
		<template v-if="!state.users.createUser">
			<h1>{{ $lang.Users.headerText }}</h1>
			<div id="userArea">
				<div
					class="newUser"
					@click="state.users.createUser = true"
					:title="$lang.Users.titleCreateUser"
				>
					+
				</div>
				<div
					class="user"
					v-for="user in state.users.userList"
					:key="user._id"
					@click.self="selectUser(user)"
				>
					<div class="userName">{{ user.name }}</div>
					<div class="buttonArea">
						<button
							:title="$lang.Users.titleEditUser"
							@click="editUser(user)"
							id="left"
						>
							<img src="@/assets/pencil.svg" alt="edit" />
						</button>
						<button :title="$lang.Users.titleRemoveUser" id="right">
							<img
								src="@/assets/trash.svg"
								alt="delete"
								@click="deleteUser(user)"
							/>
						</button>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>
import CreateUser from "./Components/CreateUser"

import { reactive, computed } from "vue"
import { useStore } from "vuex"
import { useRouter } from "vue-router"
import { ipcRenderer } from "electron"
import vex from "@/plugins/vex"

export default {
	name: "Users",

	components: { CreateUser },

	created() {
		ipcRenderer.send("change_window_title", `| Usuários`)
	},

	watch: {
		createUser(val) {
			if (!val) {
				this.state.userEdit = {}
			}
		},
	},

	setup() {
		const store = useStore()
		const router = useRouter()

		const state = reactive({
			users: store.state.users,
			userEdit: {},
		})

		const createUser = computed(() => {
			return state.users.createUser
		})

		const selectUser = (user) => {
			state.users.activeUser = user
			store.dispatch("getProgress")

			router.push("/")
		}

		const editUser = (user) => {
			state.userEdit = user
			state.users.createUser = true
		}

		const deleteUser = (user) => {
			vex.dialog.confirm({
				message: `Seu progresso de leitura será perdido, deseja mesmo apagar o usuário ${user.name}? `,
				callback: (res) => {
					if (res) {
						ipcRenderer.send("remove_user", JSON.parse(JSON.stringify(user)))
					}
				},
			})
		}

		return {
			state,
			createUser,
			selectUser,
			editUser,
			deleteUser,
		}
	},
}
</script>

<style lang="scss">
#Users {
	background-color: rgba(255, 255, 255, 0.3);
	width: 90%;
	height: 300px;
	border-radius: 5px;
	overflow: hidden;
	margin: 0 auto;
	box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);

	h1 {
		text-align: center;
		font-weight: lighter;
		background-color: rgba(255, 255, 255, 0.3);
		padding: 15px;
		height: 70px;
		box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);
	}

	#userArea {
		height: calc(100% - 70px);
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		overflow: auto;
		align-items: center;
		justify-content: center;
		.user,
		.newUser {
			cursor: pointer;
			background-color: rgba(255, 255, 255, 0.6);
			width: 150px;
			height: 150px;
			border-radius: 100px;
			margin: 5px;
			border: 3px solid rgba(255, 255, 255, 0.9);
			overflow: hidden;
			background-origin: content-box;
			background-repeat: no-repeat;
			background-size: fit;
			background-position: center;
			background-image: url("../../assets/user-profile.svg");
			display: flex;
			align-items: center;
			transition: background-color 0.6s ease;
			position: relative;

			&:hover {
				background-color: rgba(255, 255, 255, 0.9);
			}

			.userName {
				width: 100%;
				height: 20px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 18px;
				border-radius: 5px;
				position: absolute;
				top: 50%;
				background-color: white;
				z-index: 1;
			}

			.buttonArea {
				width: 100%;
				margin-top: 10px;
				position: absolute;
				top: 50%;
				height: 50%;
				display: flex;
				justify-content: center;
				align-items: center;

				#left {
					padding-left: 20px;
				}

				#right {
					padding-right: 20px;
				}

				button {
					background: none;
					border: none;
					height: 100%;
					width: 50%;
					cursor: pointer;
					border-radius: 5px;
					opacity: 0;
					transition: opacity 0.6s ease;
					background-color: rgba(255, 255, 255, 0.6);

					&:hover {
						opacity: 1;
					}

					img {
						width: 25px;
						height: 25px;
					}
				}
			}
		}

		.newUser {
			background-image: none !important;
			font-size: 180px;
			font-weight: lighter;
			text-align: center;
			justify-content: center;
			color: rgba(0, 0, 0, 0.6);
		}
	}
}
</style>
