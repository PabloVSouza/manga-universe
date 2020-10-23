import Vue from "vue"

const ptBR = require("./ptBR")
const enUS = require("./enUS")

const defaultLanguage = "ptBR"

const lang = { ptBR, enUS }

Vue.prototype.$lang = lang[defaultLanguage]
