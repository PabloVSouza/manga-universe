import Vue from "vue"

const ptBR = require("./ptBR")

const defaultLanguage = "ptBR"

const lang = { ptBR }

Vue.prototype.$lang = lang[defaultLanguage]
