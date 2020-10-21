import Vue from "vue"
import VueRouter from "vue-router"
import Home from "@/views/Home/Home"
import Downloader from "@/views/Downloader/Downloader"
import Reader from "@/views/Reader/Reader"
import Users from "@/views/Users/Users"
import Url from "@/views/Url/Url"

Vue.use(VueRouter)

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
	},
	{
		path: "/downloader",
		name: "Downloader",
		component: Downloader,
	},
	{
		path: "/downloader/:downloadMore",
		name: "DownloadMore",
		component: Downloader,
	},
	{
		path: "/reader",
		name: "Reader",
		component: Reader,
	},
	{
		path: "/users",
		name: "Users",
		component: Users,
	},
	{
		path: "/url",
		name: "Url",
		component: Url,
	},
]

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
})

export default router
