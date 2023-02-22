import { BrowserRouter, HashRouter } from "react-router-dom"
import { Provider } from "react-redux"
import { createRoot } from "react-dom/client"
import store from "store"
import Routes from "routes"


import "scss/style.scss"

// type isElectron = boolean

// const { isElectron } = window

// console.log(isElectron)

const root = createRoot(document.getElementById("root"))
root.render(
	<Provider store={store}>
		{/* {isElectron ? (
			<HashRouter>
				<Routes />
			</HashRouter>
		) : ( */}
			<BrowserRouter>
				<Routes />
			</BrowserRouter>
    {/* )}  */}
	</Provider>
)