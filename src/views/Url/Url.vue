<template>
	<div id="Url">
		<h1>
			Digite o endereço do site
		</h1>

		<div id="formArea">
			<input type="text" v-model="state.txtUrl" placeholder="Url" />
		</div>

		<div id="buttonArea">
			<button @click.prevent="registerUrl()">
				<img src="@/assets/confirm.svg" alt="confirm" />
			</button>
		</div>
	</div>
</template>

<script>
const crypto = require("crypto-js")
const { ipcRenderer } = require("electron")
const { reactive } = require("vue")

export default {
	name: "Url",

	setup() {
		const state = reactive({
			txtUrl: "",
			hashSite: "78085432a8a6d275813f122c6c88c416",
		})

		const registerUrl = () => {
			if (crypto.MD5(this.txtUrl) == this.hashSite) {
				ipcRenderer.send("write_url", this.txtUrl)
			} else {
				this.$vex.dialog.alert("Endereço inválido")
			}
		}

		return { state, registerUrl }
	},
}
</script>

<style lang="scss">
#Url {
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
