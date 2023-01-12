
<template>
  	<f7-page @page:init="pageLoad">
	 	<f7-navbar :back-link="true" :title="trans('modules.expenses.addExpense')" sliding layout="light" theme="white" snapPageScrollToTransparentNavbar>
	 	</f7-navbar>
	 	<f7-block>
			<f7-card>
				<f7-card-content>

                <f7-list inset form @submit.prevent="false;" id="form" >
                  <f7-list-item :title="trans('app.employee')" smart-select v-if="!isEmployeeRoute" id="userSmartSelect"
                                @change="onUserChange"
                                :smart-select-params="{openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search')}" >
                     <select name="employee" @change="onUserChange">
                        <option :value="user.id" v-for="user in users" :key="user.user_id">{{user.name}}</option>
                     </select>
                  </f7-list-item>
                  <f7-input
                      v-if="isEmployeeRoute"
                      name="employee"
                      type="hidden"
                      :value="$store.state.user.id"
                  ></f7-input>

                  <f7-list-item :title="trans('app.project')" @change="onProjectChange" smart-select id="projectSmartSelect"
                                :smart-select-params="{openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search')}" >
                     <select name="project" @change="onProjectChange">
                        <option :value="project.id" v-for="project in projects" :key="project.user_id">{{project.project_name}}</option>
                     </select>
                  </f7-list-item>

                  <f7-list-input
                      :label="trans('app.currency')"
                      type="select"
                      name="currency"
                      @change="onCurrencyChange"
                      :placeholder="trans('app.selectCurrency')"
                  >
                     <option :value="currency.id" v-for="currency in currencies" :key="currency.id">{{currency.currency_code + '-(' + currency.currency_symbol+ ')'}}</option>
                  </f7-list-input>
                  <f7-list-input
                      :label="trans('modules.expenses.itemName')"
                      floating-label
                      required
                      validate-on-blur
                      clear-button
                      autocorrect="off"
                      type="text"
                      :error-message="trans('validation.required', trans('modules.expenses.itemName'))"
                      :placeholder="trans('modules.expenses.itemName')"
                      @input="item.item_name = $event.target.value"
                  ></f7-list-input>
                  <f7-list-input
                      :label="trans('app.price')"
                      floating-label
                      required
                      validate-on-blur
                      clear-button
                      autocorrect="off"
                      type="number"
                      :error-message="trans('validation.required', trans('app.price'))"
                      :placeholder="trans('app.price')"
                      @input="item.price = $event.target.value"
                  ></f7-list-input>
                  <f7-list-input
                      :label="trans('modules.expenses.purchaseFrom')"
                      floating-label
                      required
                      validate-on-blur
                      clear-button
                      autocorrect="off"
                      type="text"
                      :error-message="trans('validation.required', trans('modules.expenses.purchaseFrom'))"
                      :placeholder="trans('modules.expenses.purchaseFrom')"
                      @input="item.purchase_from = $event.target.value"
                  ></f7-list-input>
                  <f7-list-input
                      :label="trans('modules.expenses.purchaseDate')"
                      clear-button
                      type="datepicker"
                      readonly
                      :calendar-params="{dateFormat: getCompanyDatePickerFormat}"
                      :placeholder="trans('modules.expenses.purchaseDate')"
                      @change="onStartDateChange($event.target.value)"
                  ></f7-list-input>
                  <f7-list-input v-if="!isEmployeeRoute"
                      :label="trans('app.status')"
                      type="select"
                      name="status"
                      @change="onStatusChange"
                      :placeholder="trans('app.selectStatus')"
                  >
                     <option :value="singleStatus" :selected="singleStatus==item.status" v-for="singleStatus in status" :key="singleStatus">{{ formatStatus(singleStatus) }}</option>
                  </f7-list-input>

                </f7-list>

<!--               <f7-block inner class="margin-top">-->
<!--                   <f7-block-title class="form-input-label">{{ trans('app.bill') }}</f7-block-title>-->
<!--                   <f7-row>-->
<!--                     <f7-col>-->
<!--                        <f7-button @click="openActionSheet" fill>{{ trans('modules.expenses.attachBill') }}</f7-button>-->
<!--                     </f7-col>-->
<!--                     <f7-col v-if="this.item.bill || this.billImage">-->
<!--                        <f7-button @click="removeBill" fill color="red">{{ trans('modules.expenses.removeBill') }}</f7-button>-->
<!--                     </f7-col>-->
<!--                  </f7-row>-->
<!--                  <img v-if="billImageUrl" :src="billImageUrl" style="margin-top: 15px; width: 100%;"/>-->
<!--               </f7-block>-->
               <f7-block inset>&nbsp;</f7-block>
					<br>
					<br>
					<f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid">{{ trans('app.submit') }}
					</f7-button>
				</f7-card-content>

				<f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0">{{ trans('messages.internetConnectionError') }}
				</f7-block>

			</f7-card>
		</f7-block>
  </f7-page>
</template>

<script type="text/babel">
	import Cache from '../../assets/vue/scripts/cache';
	import CommonMixin from '../../assets/vue/mixins/common';
	import ModuleMixin from './mixin';
   import {Device} from "framework7/framework7-lite.esm.bundle";

  	export default {
		mixins: [CommonMixin, ModuleMixin],
		data() {
			return {
				item: {
                item_name: null,
                purchase_date: null,
                price: null,
                user: {
                    id: null,
                },
                project: {
                    id: null,
                },
                currency: {
                    id: null,
                },
                bill: null,
					status: 'pending',
                },
                action: '/file',
                headers: {
                   Authorization: `Bearer ${ this.$store.state.token }`,
                },
                users: [],
                projects: [],
                currencies: [],
                status: ['approved', 'pending','rejected'],
                deviceReady: false,
                billUrl: null,
                billImage: null,
                billImageUrl: null,
                error: null,
                push: null,
			};
		},
		computed:{
			formValid() {
				const $$ = this.Dom7;
				return this.item.item_name && this.item.purchase_date && this.item.price && this.item.status && this.item.user.id && this.item.project.id && this.item.currency.id && $$('#form')[0] && $$('#form')[0].checkValidity();
			},
            fileAction () {
                if (!this.action.startsWith('http')) {
                   return `${ this.$store.state.api_url + this.action }?type=expense-invoice`;
                }
                else {
                   return `${ this.action }?type=expense-invoice`;
                }
            },
		},
        mounted () {
            document.addEventListener("deviceready", this.onDeviceReady, false);
        },
	 	methods:{
            onDeviceReady() {
                this.deviceReady = true;
            },
			init () {
				this.$f7.preloader.show();

				const promises = [];
				promises.push(this.getUsers());
				promises.push(this.getProjects(this.isEmployeeRoute ? 'me' : null));
				promises.push(this.getCurrencies());

				Promise.all(promises).then(() => {
					this.item.project =  this.projects[0];
                    let projectSmartSelect = this.$f7.smartSelect.get('#projectSmartSelect .smart-select');
                    projectSmartSelect.setValue(this.item.project.id);
					this.item.currency =  this.currencies[0];
                    this.item.user =  this.users[0];
                    if (!this.isEmployeeRoute){
                        let userSmartSelect = this.$f7.smartSelect.get('#userSmartSelect .smart-select');
                        userSmartSelect.setValue(this.item.user.id);
                    }

					this.$f7.preloader.hide();
				}, () => {
					this.$f7.preloader.hide();
				});
			},

			pageLoad (page) {
				this.init();
			},
			submit (){
				this.$f7.preloader.show();

                // const promiseArray = [];
                //
                // if (this.billImage) {
                //     const filePromise = this.uploadFile(this.billImage);
                //     console.log('filePromise'+filePromise);
                //     filePromise.then((response) => {
                //         this.item.bill = response.data.name;
                //         this.billUrl = response.data.download_url;
                //     }, (error) => {
                //         if (error) {
                //          this.busy = false;
                //         }
                //     });
                //
                //     promiseArray.push(filePromise);
                // }
                //
                // Promise.all(promiseArray).then(() => {
                    this.$http.post(`/expense`,this.item).then((response) => {
                        this.$f7.preloader.hide();
                        Cache.removeMatching('expense');
                        this.$store.commit('sendCacheInvalidate', 'expense');
                        this.$f7router.back();
                    }, () => {
                        this.$f7.preloader.hide();
                    });
                // });
            },

		}
	};
</script>
