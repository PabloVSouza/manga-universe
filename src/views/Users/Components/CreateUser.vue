<template>
	<div id="CreateUser">
		<h1>{{ $lang.Users.CreateUser.headerText }}</h1>
		<div id="formArea">
			<input
				type="text"
				:placeholder="$lang.Users.CreateUser.textPlaceHolder"
				v-model="state.user.name"
			/>
		</div>
		<div id="buttonArea">
			<button
				@click.prevent="$emit('close-form')"
				:title="$lang.Users.CreateUser.titleCancel"
			>
				<img src="@/assets/cancel.svg" alt="cancel" />
			</button>
			<button
				@click.prevent="registerUser()"
				:title="$lang.Users.CreateUser.titleConfirm"
			>
				<img src="@/assets/confirm.svg" alt="confirm" />
			</button>
		</div>
	</div>
</template>

<script>
const { ipcRenderer } = require("electron")

import { reactive } from "vue"
import { useStore } from "vuex"

export default {
	name: "CreateUser",
	props: ["editUser"],

	setup(props, ctx) {
		const store = useStore()
		const state = reactive({
			user: {
				name: "",
				reverse: true,
			},
			users: store.state.users,
		})

		const registerUser = async () => {
			if (state.user.name != "") {
				if (props.editUser._id == undefined) {
					await ipcRenderer.invoke("insert", {
						table: "User",
						data: JSON.parse(JSON.stringify(state.user)),
					})
				} else {
					console.log("oi")
					let res = await ipcRenderer.send("update", {
						table: "User",
						query: { _id: state.user._id },
						data: JSON.parse(JSON.stringify(state.user)),
					})

					console.log(res)
				}
				ctx.emit("close-form")
			}
		}

		if (props.editUser.name != undefined) {
			state.user = JSON.parse(JSON.stringify(props.editUser))
		}

		return { state, registerUser }
	},
}
</script>

<style lang="scss">
#CreateUser {
	width: 100%;
	height: 100%;

	#formArea {
		height: 160px;
		display: flex;
		justify-content: center;
		align-items: center;
		input[type="text"] {
			background-color: rgba(255, 255, 255, 0.3);
			border: none;
			border-radius: 5px;
			height: 50px;
			width: 90%;
			font-size: 30px;
			box-shadow: 3px 7px 16px -5px rgba(0, 0, 0, 0.75);
			padding: 10px;
			text-align: center;

			&::placeholder {
				color: rgba(0, 0, 0, 0.3);
			}
		}
	}

	#buttonArea {
		height: 70px;
		text-align: center;
		padding: 2.5px;
		button {
			background-color: inherit;
			border: none;
			height: 65px;
			width: 65px;
			border-radius: 5px;
			margin: 0 30px;
			cursor: pointer;
			transition: background-color 0.6s ease;
			display: inline-flex;
			align-items: center;
			justify-content: center;

			&:hover {
				background-color: rgba(255, 255, 255, 0.3);
			}
			img {
				width: 55px;
				height: 55px;
			}
		}
	}
}
</style>
