import Vue from 'vue'
import Vuex from 'vuex'

import radModule from './rad'
import walletModule from './wallet'
import marketplaceModule from './marketplace'
import uiInteractionsModule from './uiInteractions'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    uiInteractions: uiInteractionsModule,
    rad: radModule,
    wallet: walletModule,
    marketplace: marketplaceModule,
  },
})
