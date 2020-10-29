import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import vex from "./plugins/vex"
import lang from "./lang"

createApp(App)
	.use(router)
	.use(store)
	.use(vex)
	.use(lang)
	.mount("#app")
