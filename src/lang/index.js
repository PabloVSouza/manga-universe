const ptBR = require("./ptBR")
const enUS = require("./enUS")

const defaultLanguage = "ptBR"

const lang = { ptBR, enUS }

const VueLang = {
	install(app, options) {
		if (!options) {
			options = {}
		}

		app.config.globalProperties.$lang = lang[defaultLanguage]
	},
}
export default VueLang
