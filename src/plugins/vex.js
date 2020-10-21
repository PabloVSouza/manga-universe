// src/plugins/vex.js

import Vue from "vue"
import vex from "vex-js"
import vexDialog from "vex-dialog"

// Main css
import "vex-js/dist/css/vex.css"

// Themes (Import all themes you want to use here)
import "vex-js/dist/css/vex-theme-default.css"
import "vex-js/dist/css/vex-theme-os.css"

// Options
vex.defaultOptions.className = "vex-theme-default"

// Register vex-dialog
vex.registerPlugin(vexDialog)

Vue.prototype.$vex = vex
