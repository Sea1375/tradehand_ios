import Vuex from "vuex";
import moment from "moment";
import Vue from "vue";

import { API_URL } from "./../config";

const COMPANY_STORAGE_KEY = "crm_company";
const GLOBAL_STORAGE_KEY = "crm_global";
const TRANSLATIONS_STORAGE_KEY = "crm_translations";
const VERSIONS_STORAGE_KEY = "crm_versions";
const COMPANY_TRANSLATIONS_STORAGE_KEY = "crm_company_translations";
const USER_STORAGE_KEY = "crm_user";
const TOKEN_STORAGE_KEY = "crm_token";
const EXPIRES_STORAGE_KEY = "crm_expire";
let API_URL_STORAGE_KEY = "crm_api_key";
let DOMAIN_STORAGE_KEY = "crm_domain_key";

const state = {
  api_url: window.localStorage.getItem(API_URL_STORAGE_KEY) || null,
  host: window.localStorage.getItem(DOMAIN_STORAGE_KEY) || null,
  company:
    JSON.parse(
      window.localStorage.getItem(COMPANY_STORAGE_KEY) !== "undefined"
        ? window.localStorage.getItem(COMPANY_STORAGE_KEY)
        : null
    ) || null,
  global:
    JSON.parse(
      window.localStorage.getItem(GLOBAL_STORAGE_KEY) !== "undefined"
        ? window.localStorage.getItem(GLOBAL_STORAGE_KEY)
        : null
    ) || null,
  user:
    JSON.parse(
      window.localStorage.getItem(USER_STORAGE_KEY) !== "undefined"
        ? window.localStorage.getItem(USER_STORAGE_KEY)
        : null
    ) || null,
  version:
      JSON.parse(
          window.localStorage.getItem(VERSIONS_STORAGE_KEY) !== "undefined"
              ? window.localStorage.getItem(VERSIONS_STORAGE_KEY)
              : null
      ) || null,
  translation:
    JSON.parse(
      window.localStorage.getItem(TRANSLATIONS_STORAGE_KEY) !== "undefined"
        ? window.localStorage.getItem(TRANSLATIONS_STORAGE_KEY)
        : null
    ) || null,
  companyTranslation:
    JSON.parse(
      window.localStorage.getItem(COMPANY_TRANSLATIONS_STORAGE_KEY) !== "undefined"
        ? window.localStorage.getItem(COMPANY_TRANSLATIONS_STORAGE_KEY)
        : null
    ) || null,
  token: window.localStorage.getItem(TOKEN_STORAGE_KEY) || null,
  expires: window.localStorage.getItem(EXPIRES_STORAGE_KEY) || null,
  error: null,
  title: "Worksuite",
  // Listen to changes to this variable in components and refresh data when it changes.
  // This is used to send signal when session token has been refreshed
  reload: 0,
  cacheInvalidated: null,
  toaster: {
    time: 3000,
    type: null,
    message: null,
  },
};

const mutations = {
  updateHost(state, host) {
    state.host = host;
    state.api_url = host !== null ? `${host}/api/v1` : null;

    console.log("updateHost");
    if (host === null) {
      window.localStorage.setItem(API_URL_STORAGE_KEY, "");
      window.localStorage.setItem(DOMAIN_STORAGE_KEY, "");
    } else {
      window.localStorage.setItem(API_URL_STORAGE_KEY, state.api_url);
      window.localStorage.setItem(DOMAIN_STORAGE_KEY, state.host);
    }
  },
  updateCompany(state, company) {
    state.company = company;

    if (company === null) {
      company = "";
    }

    window.localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(company));
  },
  updateGlobal(state, global) {
    state.global = global;

    if (global === null) {
      global = "";
    }

    window.localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(global));
  },
  updateUser(state, user) {
    state.user = user;
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  updateCompanyTranslation(state, companyTranslation) {
    state.companyTranslation = companyTranslation;
    window.localStorage.setItem(COMPANY_TRANSLATIONS_STORAGE_KEY, JSON.stringify(companyTranslation));
  },
  updateTranslation(state, translation) {
    state.translation = translation;
    window.localStorage.setItem(TRANSLATIONS_STORAGE_KEY, JSON.stringify(translation));
  },
  updateVersion(state, version) {
    state.version = version;
    window.localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(version));
  },
  updateError(state, error) {
    state.error = error;
  },
  updateTitle(state, title) {
    state.title = title;

    if (state.company !== null || state.company !== undefined) {
      document.title = `${title} - ${state.company.name}`;
    } else {
      document.title = `${title} - crm`;
    }
  },
  updateToken(state, token) {
    state.token = token;
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  updateExpires(state, expires) {
    state.expires = new Date(expires);
    window.localStorage.setItem(EXPIRES_STORAGE_KEY, expires);
  },
  sendReload(state) {
    state.reload = Math.random();
  },
  sendCacheInvalidate(state, endpoint) {
    // We add random number at end so that same endpoint updated again will fire reload again
    state.cacheInvalidated =
      endpoint + (Math.floor(Math.random() * 1000) + 1000);
  },
};

const actions = {
  updateCompany(context) {
    if (context.state.host !== null) {
      Vue.http.get("/company").then(
        (response) => {
          if (typeof response.data === "object") {
            context.commit("updateCompany", response.data.data);
          }
        },
        (response) => {
          if (
            response.data.error &&
            response.data.error.innererror &&
            (response.data.error.innererror.code === 2004 ||
              response.data.error.innererror.code === 2002)
          ) {
            this.$f7.dialog.alert(
              "Your company account has been disabled. Please contact your manager.",
              null
            );
            context.commit("updateCompany", null);
            context.commit("updateHost", null);
            context.dispatch("logout");
          }
        }
      );
    }
  },
  updateUser(context) {
    console.log("updateCompany", context.state.host, context.state.user);
    if (context.state.host !== null) {
      const user = context.state.user;

      // Vue.http.get(`/employee/${ user.id }?fields=id,first_name,last_name,name,permissions,profile_image,profile_image_url,location,department,designation,visibility`).then((response) => {
      //     if (typeof response.data === 'object') {
      //         context.commit('updateUser', response.data.data);
      //     }
      // });
    }
  },
  logout(context) {
    // Clear session storage
    window.sessionStorage.clear();
    context.commit("updateToken", "");
    context.commit("updateExpires", "");
    context.commit("updateUser", "");
    context.commit("updateTranslation", this.state.companyTranslation);

    // Vue.http.post('/auth/logout');
  },
};

const getters = {
  isError: (state) => state.error === null,
  isLoggedIn: (state) => {
    if (state.token === null) {
      return false;
    } else {
      return moment(state.expires).isAfter(moment());
    }
  },
};

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations,
});
