import Vue from 'vue'
import Vuex from 'vuex'

import App from './App'

// import '../hotbox/hotbox.css'  //项目直接使用了hotbox.scss，所以不需再引入

import '../lib/VueTestcaseMinderEditor.css'
import VueTestcaseMinderEditor from '../lib/VueTestcaseMinderEditor.umd.min.js'

Vue.use(VueTestcaseMinderEditor)
console.log('using VueTestcaseMinderEditor', VueTestcaseMinderEditor)

Vue.use(Vuex)
const store = new Vuex.Store({
  modules: {
    caseEditorStore: VueTestcaseMinderEditor.caseEditorStore
  }
})

new Vue({
  el: '#app',
  store,
  render: h => h(App),
  components: {
    App
  }
}).$mount('#app')
