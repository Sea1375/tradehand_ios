import Vue from 'vue';

import Http from 'vue-resource';
import Vuex from 'vuex';

[Http, Vuex].forEach((Plugin) => Vue.use(Plugin));

export { Vue };
