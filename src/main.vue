
<template>
    <!-- App -->

    <f7-app :params="f7params">

        <!-- Statusbar -->
        <f7-view v-if="!loggedIn" id="login-screen">
            <!-- Login Page -->

            <f7-page login-screen v-if="!showdomain" :no-swipeback="true">
                <f7-login-screen-title><img :src="logo" class="login-screen-logo"/></f7-login-screen-title>
                <f7-list form @submit.prevent="false;" class="login-form">

                    <f7-list-input
                        :label="trans('app.email')"
                        floating-label
                        clear-button
                        validate-on-blur
                        autocorrect="off"
                        name="username"
                        type="email"
                        :placeholder="trans('app.email')"
                        :value="credentials.email"
                        @input="credentials.email = $event.target.value"
                    ></f7-list-input>
                    <f7-list-input
                        :label="trans('app.password')"
                        floating-label
                        name="password"
                        :type="passwordFieldType"
                        validate-on-blur
                        minlength="6"
                        :placeholder="trans('app.password')"
                        :value="credentials.password"
                        @input="credentials.password = $event.target.value"
                    >
                       <f7-link slot="inner-end" @click="switchVisibility" class="passwordShowHide"><f7-icon :f7="passwordEyeIcon"></f7-icon></f7-link>
                    </f7-list-input>

                </f7-list>
                <f7-block>
                    <f7-col tag="span">
                        <f7-button fill color="green" class="login-btn" large raised round
                                   :disabled="!loginFormValid" @click="login">{{ trans('app.login') }}
                        </f7-button>
                        <f7-block-footer>
                            <f7-button class="no-transform" color="black" @click="changeCompany">{{trans('app.signInToDifferentDomain')}}</f7-button>

                        </f7-block-footer>
                    </f7-col>

                </f7-block>

                <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0">{{ trans('messages.internetConnectionError') }}
                </f7-block>
                <f7-block class="error-block" v-if="error">
                    <template v-if="error.code === 1">{{ trans('messages.serverSideErrorOccurred') }}
                    </template>
                    <template v-if="error.code === 422">{{ trans('validation.invalidEmail') }}</template>
                    <template v-if="error.innererror && error.innererror.code === 2001">{{ trans('validation.invalidEmailPassword') }}
                    </template>

                </f7-block>

            </f7-page>


            <f7-page login-screen v-else :no-swipeback="true">
                <f7-login-screen-title><img :src="mainLogo" class="login-screen-logo"/></f7-login-screen-title>
                <f7-list form @submit.prevent="saveCompany" class="domain-form">
<!--                    <f7-list-input-->
<!--                            type="select"-->
<!--                            defaultValue="https://"-->
<!--                    >-->
<!--                        <option value="http://">http://</option>-->
<!--                        <option value="https://">https://</option>-->
<!--                    </f7-list-input>-->

                    <f7-list-input autocapitalize="off"
                                   autocorrect="off"
                                   name="domain"
                                   type="url"
                                   validate-on-blur
                                   error-message="Please enter valid domain url"
                                   placeholder="https://your-url.domain.com"
                                   :value="domain"
                                   id="domain"
                                   clear-button
                                   @input="domain = $event.target.value"
                    ></f7-list-input>
                </f7-list>
                <f7-block>
                    <f7-col tag="span">
                        <f7-button fill color="green" class="login-btn" large raised round
                                   @click="saveCompany" :disabled="!domainInputValid">Save
                        </f7-button>
                        
<!--                        <f7-block-footer class="margin-top">-->
<!--                            <f7-button class="no-transform" color="black" @click="opencrmWebsite()">Don't have an account?</f7-button>-->
<!--                        </f7-block-footer>-->

                    </f7-col>

                </f7-block>

<!--                <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0">Connection-->
<!--                    Error! Please make sure you are connected to internet.-->
<!--                </f7-block>-->
                <f7-block class="error-block" v-if="error">
                    <template v-if="error.code === 5">{{ trans('You have not installed RestAPI Module') }}
                    </template>
                  <template v-if="error.code === 6">{{ trans('Please update application to 3.8.7 or higher version') }}
                    </template>
                    <template v-if="error.code === 2">{{ trans('Please enter a valid URL') }}</template>
                  <template v-if="error.code === 7">{{ trans(error.message) }}</template>
                </f7-block>

                <!-- Sheet Push -->
                <f7-toolbar color-theme="orange" tabbar position="bottom" v-if="showAddToHomeScreen" >
                    <f7-link tab-link-active @click="callInstallPrompt()">Add to Homescreen</f7-link>
                </f7-toolbar>
            </f7-page>

        </f7-view>

        <!-- Left Panel -->
        <f7-panel left cover layout="dark" v-if="loggedIn">
            <side-menu></side-menu>
        </f7-panel>

        <!-- Main Views -->
        <f7-views v-if="loggedIn">
            <f7-view main class="safe-areas" :url="dashboardUrl">
                <!-- Pages -->

            </f7-view>
        </f7-views>

    </f7-app>
</template>
<script type="text/babel">
    import {Device} from 'framework7/framework7-lite.esm.bundle.js';
    import cordovaApp from './js/cordova-app.js';
    import {DOMAIN, DOMAIN_LOGO} from './assets/vue/config';
    import Dashboard from './pages/dashboard';

    import Routes from './js/routes';
    import SideMenu from './pages/sidemenu'
    import CommonMixin from "./assets/vue/mixins/common";

    export default {
        mixins: [CommonMixin],
        data() {
            return {
                f7params: {
                    id: 'com.froiden.worksuite', // App bundle ID
                    name: 'worksuite', // App name
                    theme: 'auto', // Automatic theme detection
                    pushState: true,
                    // Register service worker
                    // serviceWorker: Device.cordova ? {} : {
                    //     path: '/service-worker.js',
                    // },


                    // App routes
                    routes: Routes,


                    // Input settings
                    input: {
                        scrollIntoViewOnFocus: Device.cordova && !Device.electron,
                        scrollIntoViewCentered: Device.cordova && !Device.electron,
                    },
                    // Cordova Statusbar settings
                    statusbar: {
                        iosOverlaysWebView: true,
                        androidOverlaysWebView: false,
                        androidTextColor: 'white',
                    },
                },
                loginShow: false,
                passwordFieldType: 'password',
                passwordEyeIcon: 'eye',
                domain: null,
                dashboardUrl: '/',

                credentials: {
                    email: null,
                    password: null,
                    remember_me: true,
                },

                error: null,
                push: null,
                showAddToHomeScreen : false,
                deferredPrompt:null
            };
        },
        mounted() {
            const self = this;
            window.addEventListener('beforeinstallprompt', function(event) {
                event.preventDefault();
                self.deferredPrompt = event;
                self.showAddToHomeScreen = true;
            });

            document.addEventListener("deviceready", this.onDeviceReady, false);
            document.addEventListener("resume", this.onResume, false);

            this.$f7ready((f7) => {
                // Init cordova APIs (see cordova-app.js)
                if (Device.cordova) {
                    cordovaApp.init(f7);
                }
                // Call F7 APIs here
            });

        },
        computed: {
            loggedIn() {
                let isLoggedIn = this.$store.getters.isLoggedIn;
                if (isLoggedIn) {
                    this.getTranslations();
                }
                this.dashboardUrl = '/'
                if(this.$store.state.user && this.$store.state.user.user_other_role ==='employee') {
                    this.dashboardUrl = '/self/'
                }
                return isLoggedIn;
            },
            showdomain() {
                return this.$store.state.host === null || this.$store.state.host === "null";
            },
            mainLogo() {
                return DOMAIN_LOGO;
            },
            logo() {
                if (this.$store.state.company !== null) {
                    return this.$store.state.company.logo_url;
                }
            },
            loginFormValid() {
                const $$ = this.Dom7;
                return (this.credentials.password !== "" && this.credentials.email !== "") && $$('.login-form')[0] && $$('.login-form')[0].checkValidity();
            },
            domainInputValid() {
                const $$ = this.Dom7;
                const domain = this.domain;
                return (domain !== null && domain !== "") && $$('.domain-form')[0] && $$('.domain-form')[0].checkValidity();
            },

        },
        methods: {
            callInstallPrompt() {
                const self = this;
                self.showAddToHomeScreen = true;
                self.deferredPrompt.prompt();

                // Wait for the user to respond to the prompt
                self.deferredPrompt.userChoice
                    .then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the A2HS prompt');
                        } else {
                            console.log('User dismissed the A2HS prompt');
                        }
                        self.deferredPrompt = null;
                    });
            },
            opencrmWebsite() {
                window.open(DOMAIN, '_system');
            },
            resetErrors() {
                this.error = null;
                this.$store.state.error = null;
            },
            saveCompany() {

                this.resetErrors();

                const self = this;
                this.domain = this.domain.slice(-1) === '/' ? this.domain.substring(0, this.domain.lastIndexOf('/')) : this.domain
                let domain = this.domain;

                if (domain === '' || domain === null || domain === 'your-url') {
                    this.error = {
                        code: 2,
                    };
                    return;
                }
                self.$f7.preloader.show();
                let restAPIPlugin = false;
                let errorMessage = null;
                this.$http.get(`${domain}/api/v1/purchased-module`).then((response) => {
                    this.$store.commit('updateVersion', response.data.data);
                    restAPIPlugin = response.data.data.hasOwnProperty('RestAPI');
                    errorMessage = response.data.data.message;
                    
                    if(errorMessage !== ''){
                        this.error = {
                            code: 7,
                            message: errorMessage,
                        };
                        self.$f7.preloader.hide();
                    }
                    else if(restAPIPlugin && errorMessage === '') {
                        this.$http.get(`${domain}/api/v1/lang`).then((response) => {
                            this.$store.commit('updateTranslation', response.data.data);
                            this.$store.commit('updateCompanyTranslation', response.data.data);
                        });
                        domain = domain.toLowerCase();

                        setTimeout(() => {
                            this.$http.get(`${domain}/api/v1/app`).then((response) => {

                                if (typeof response.data === 'object') {
                                    this.$store.commit('updateHost', `${domain}`);
                                    this.$store.commit('updateCompany', response.data.data);
                                    this.error = null;
                                    // console.log('saveCompany');
                                    // this.getTranslations();
                                } else {
                                    this.error = {
                                        code: 1,
                                    };
                                }
                                self.$f7.preloader.hide();
                            }, (response) => {
                                self.$f7.preloader.hide();
                                this.error = response.data.error;
                            });
                        }, 1200);
                    }
                    else{
                        this.error = {
                            code: 5,
                        };
                        self.$f7.preloader.hide();
                    }
                }, (response) => {
                    self.$f7.preloader.hide();
                    if(response.data.error === 'undefined' || response.data.error === '' || response.data === '') {
                        this.error = {
                          code: 6,
                        };
                    }
                    else {
                      this.error = response.data.error;
                    }
                });
            },
            changeCompany() {
                this.$store.commit('updateCompany', null);
                this.$store.commit('updateHost', null);
            },
            editDomain() {
                document.getElementById('fauxInput').setAttribute('contentEditable', true);

                if (document.getElementById('fauxInput').innerHTML === 'your-url') {
                    document.getElementById('fauxInput').innerHTML = '';
                }

                document.getElementById('fauxInput').focus();
            },
            login() {
                this.resetErrors();
                this.$f7.preloader.show();
                let endpoint = '/auth/login';
                this.$http.post(endpoint, this.credentials).then((response) => {
                    this.$f7.preloader.hide();

                    if (typeof response.data === 'object') {
                        this.dashboardUrl = '/'
                        if(response.data.data.user.user_other_role ==='employee') {
                            this.dashboardUrl = '/self/'
                        }
                        this.$store.commit('updateToken', response.data.data.token);
                        this.$store.commit('updateExpires', response.data.data.expires);
                        this.$store.commit('updateUser', response.data.data.user);
                        this.error = null;
                        this.credentials.email = null;
                        this.credentials.password = null;
                    } else {
                        this.$f7.preloader.hide();
                        this.error = {
                            code: 1,
                        };
                    }
                    if(this.applicationName() === 'worksuite-saas') {
                        this.getCompany();
                    }
                    if(this.$store.state.user.locale !== 'en'){
                        this.getTranslations();
                    }
                    this.registerDevice();

                }, (response) => {
                    this.$f7.preloader.hide();
                    this.error = response.data.error;
                });
            },
            logout() {
                this.resetErrors();
                const self = this;
                self.$f7.preloader.show();
                this.$f7.panel.close();

                const postData = {
                    device_id: window.localStorage.getItem('crm_device_id'),
                };
                this.$http.post('/device/unregister', postData);
                // Timeout just for animation so that user does not feel abrupt logout
                setTimeout(() => {
                    self.$store.dispatch('logout');
                    let mainView = self.$f7.view.main;
                    mainView.router.refreshPage();
                    self.$f7.preloader.hide();
                }, 1000);

            },
            onDeviceReady () {
                this.registerDevice();
            },
            onResume () {
                this.resetBadgeCount();
            },
            registerDevice () {
                const f7 = this.$f7;
                const self = this;
                this.push = PushNotification.init({
                    android: {
                    },
                    ios: {
                        alert: "true",
                        badge: "true",
                        sound: "true"
                    },
                });

                this.push.on('registration', (data) => {
                    // If user is logged in, register this device with this user
                    if (this.$store.state.user) {
                        data.device = f7.device;

                        const postData = {
                            device_id: window.localStorage.getItem('crm_device_id'),
                            registration_id: data.registrationId,
                            details: JSON.stringify(data),
                            type: f7.device.os,
                        };

                        this.$http.post('/device/register', postData);
                    }
                });

                this.push.on('notification', (data) => {
                    
                    this.resetBadgeCount();
                    if (data.additionalData) {
                        let url;
                        let roleUrl = data.additionalData["gcm.notification.role"] !== 'admin' ?  '/self' : '';
                        if (data.additionalData["gcm.notification.type"] === 'task-reminder' || data.additionalData["gcm.notification.type"] === 'task') {
                            url = roleUrl + '/task/' + data.additionalData["gcm.notification.id"];
                        }
                       else if (data.additionalData["gcm.notification.type"] === 'project-member' || data.additionalData["gcm.notification.type"] === 'project-reminder') {
                          url = roleUrl + '/project/' + data.additionalData["gcm.notification.id"];
                       }
                        else if (data.additionalData["gcm.notification.type"] === 'notice-update' || data.additionalData["gcm.notification.type"] === 'new-notice') {
                          url = roleUrl + '/notice/' + data.additionalData["gcm.notification.id"];
                       }
                        else if (data.additionalData["gcm.notification.type"] === 'expense-member' || data.additionalData["gcm.notification.type"] === 'expense-admin' || data.additionalData["gcm.notification.type"] === 'expense-updated') {
                          url = roleUrl + '/expense/' + data.additionalData["gcm.notification.id"];
                       }
                        else if (data.additionalData["gcm.notification.type"] === 'leave-updated' || data.additionalData["gcm.notification.type"] === 'leave-approved' || data.additionalData["gcm.notification.type"] === 'leave-reject' || data.additionalData["gcm.notification.type"] === 'leave-single') {
                          url = roleUrl + '/leave/' + data.additionalData["gcm.notification.id"];
                       }
                        else if (data.additionalData["gcm.notification.type"] === 'leave-multiple') {
                           url = roleUrl + '/leaves';
                        }
                        
                        let mainView = self.$f7.view.main;
                        if (data.additionalData.foreground === true) {
                            // User is using the app, show different notification;

                            this.$f7.notification.create({
                                title: this.$store.state.company.company_name,
                                titleRightText: 'now',
                                subtitle: data.title,
                                text: data.message,
                                closeOnClick: true,
                                on: {
                                    click: function () {
                                        if (mainView.router.currentRoute.url === url) {
                                            mainView.router.refreshPage();
                                        }
                                        else {
                                           mainView.router.navigate(url);
                                        }
                                    }
                                }
                            }).open();

                        }
                        else {
                            if (mainView.router.currentRoute.url === url) {
                                mainView.router.refreshPage();
                            }
                            else {
                                mainView.router.navigate(url);
                            }
                        }
                    }
                });

                this.resetBadgeCount();
            },
            resetBadgeCount() {
                if (this.push) {
                    // Reset badge to zero
                    this.push.setApplicationIconBadgeNumber(() => {
                        console.log('success');
                    }, () => {
                        console.log('error');
                    }, 0);
                }
            },
            switchVisibility() {
               this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password'
               this.passwordEyeIcon = this.passwordEyeIcon === 'eye' ? 'eye_slash' : 'eye'
            },
            getTranslations() {
                this.$http.get(`/lang`).then((response) => {
                    this.$store.commit('updateTranslation', response.data.data);
                });
            },
            getCompany() {
                console.log('run');
                this.$http.get(`/company`).then((response) => {
                    this.$store.commit('updateCompany', response.data.data);
                });
            }
        },
        components: {
            'dashboard': Dashboard,
            'side-menu': SideMenu,
        }
    }
</script>
<style>
.passwordShowHide {
   z-index: 9;
   padding: 18px;
   position: absolute;
   right: 0;
}
.passwordShowHide div{
   display:none !important;
}
.passwordShowHide i{
   font-size: 18px;
   color: #888;
}
</style>