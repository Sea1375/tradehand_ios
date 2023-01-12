// Import Vue
import { Vue } from '../assets/vue/boot/core';

// Import Framework7
import Framework7 from 'framework7/framework7-lite.esm.bundle.js';

// Import Framework7-Vue Plugin
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js';

// Import Framework7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.scss';
import '../css/custom.css';

// Init Framework7-Vue Plugin
Framework7.use(Framework7Vue);

import snapPermission from '../assets/vue/directives/index';

// Global directives
Vue.directive('snap-permission', snapPermission);

import store from '../assets/vue/store';
import App from '../main.vue';
import Vue2Filters from 'vue2-filters';


Vue.use(Vue2Filters);

var app = new Vue({
  store,
  el: '#app',
  template: '<app/>',
  components: {
    app: App
  },
  on: {
    pageInit: function () {
      alert('test');
      window.addEventListener('beforeinstallprompt', function(event) {
        //  event.preventDefault();
        window.installPromptEvent = event;
      });
    }
  },
  callInstallPrompt() {
    if (window.installPromptEvent !== undefined) {
      window.installPromptEvent.prompt();
    }
  },
  created () {
    // Generate device id with which we can identify this device uniquely, because
    // registration id can change
    if (window.localStorage.getItem('crm_device_id') === null) {
        window.localStorage.setItem('crm_device_id', Math.floor(Math.random() * 18446744073709551615));
    }

    // Auth header adding interceptor
    Vue.http.interceptors.push((request, next) => {
      if (this.$store.state.token) {
        request.headers.set('Authorization', `Bearer ${ this.$store.state.token }`);
      }

      next();
    });


    // Endpoint prefix interceptor
    Vue.http.interceptors.push((request, next) => {
      const url = request.url;
      if (!url.startsWith('http')) {
        request.url = this.$store.state.api_url + url;
      }
      next();
    });

    // Error handling interceptor
    Vue.http.interceptors.push((request, next) => {
      next((response) => {
        if (!response.ok) {
          if (response.status === 0) {
            this.$store.state.error = {
              code: 0,
              message: 'Connection error',
            };

            console.log(response);
            console.log(request);

          }
          else if (typeof response.data === 'object' && (response.data.error.innererror === undefined ||
                  (
                      response.data.error.innererror && response.data.error.innererror.code !== 2000 &&
                      response.data.error.innererror && response.data.error.innererror.code !== 2001
                  )
              )
          ) {
            this.$store.state.error = response.data.error;
            if (response.data.error.code === 422 && response.data.error.details !== undefined) {

              let message = 'Please fix the errors below:<br/><br/>';

              if (this.$store.state.hasOwnProperty('translation') && this.$store.state.translation !== null) {
                message = _.get(this.$store.state.translation, 'messages.fixTheErrorsBelow');
              }
              _.forEach(Object.keys(response.data.error.details), (key) => {
                message += response.data.error.details[key][0] + '<br/>';
              });

              this.$f7.dialog.alert(message,null);
            }
            else {
              this.$f7.dialog.alert(response.data.error.message, null);
            }
          }
        }
        else {
          this.$store.state.error = null;
        }
      });
    });

    // Get /app end point
    if (this.$store.state.host !== null) {
      this.$store.dispatch('updateCompany');
    }

    if (this.$store.state.api_url == null) {
      this.$store.dispatch('logout');
    }

    // Get current user if logged in
    if (this.$store.getters.isLoggedIn) {
      this.$store.dispatch('updateUser');
    }
  },
})
