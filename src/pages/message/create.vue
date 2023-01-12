
<template>
  	<f7-page @page:init="pageLoad">
	 	<f7-navbar :back-link="true" :title="`${trans('app.send')} ${trans('modules.messages.message')}`" sliding layout="light" theme="white" snapPageScrollToTransparentNavbar>
	 	</f7-navbar>
	 	<f7-block>
			<f7-card>
				<f7-card-content>

		  			<f7-list inset form @submit.prevent="false;" id="form">

                        <f7-list-input v-if="messageSendToTypes.length > 1"
                            :label="trans('modules.messages.sendTo')"
                            type="select"
                            name="messageSendToType"
                            @change="onMessageSendToTypeChange"
                            :placeholder="trans('modules.messages.sendTo')" >
                            <option :value="messageSendToType" v-for="messageSendToType in messageSendToTypes" :key="messageSendToType">{{ formatStatus(messageSendToType) }}</option>
                        </f7-list-input>

                        <f7-list-input
                            :label="trans('modules.messages.sendTo')+' '+trans('app.employee')"
                            type="select"
                            name="employee"
                            @change="onEmployeeChange"
                            v-if="messageSendToType === 'employee'"
                            :placeholder="trans('app.employee')" >
                            <option :value="toEmployee.id" v-for="toEmployee in employees" :key="toEmployee.id">{{toEmployee.name}}</option>
                        </f7-list-input>

                        <f7-list-input
                            :label="trans('modules.messages.sendTo')+' '+trans('app.client')"
                            type="select"
                            name="client"
                            @change="onClientChange"
                            v-if="messageSendToType === 'client' && messageSetting.allow_client_employee === 'yes'"
                            :placeholder="trans('app.client')" >
                            <option :value="toClient.id" v-for="toClient in clients" :key="toClient.id">{{toClient.name}}</option>
                        </f7-list-input>

                        <f7-list-input
                            :label="trans('modules.messages.message')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('app.message'))"
                            :placeholder="trans('modules.messages.typeMessage')"
                            :value="item.message"
                            @input="item.message = $event.target.value"
                        ></f7-list-input>

					</f7-list>
					<br>
					<br>
					<f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid">
                        {{ trans('app.send') }}
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

  	export default {
		mixins: [CommonMixin, ModuleMixin],
		data() {
			return {
				item: {
                    message: null,
                    to: null,
                },
                messageSetting:null,
                messageSendToType:'employee',
                employee:null,
                client:null,
                employees: [],
                clients: [],
                messageSendToTypes: ['employee', 'client'],
				error: null,
				push: null,
			};
		},
		computed:{
			formValid() {
				const $$ = this.Dom7;
				return this.item.message && $$('#form')[0] && $$('#form')[0].checkValidity();
				// return true;
			},
		},
	 	methods:{

			init () {
				this.$f7.preloader.show();

				const promises = [];
				promises.push(this.getEmployees());
				promises.push(this.getClients());
				promises.push(this.getMessageSetting());

				Promise.all(promises).then(() => {
				    if (this.messageSetting.allow_client_employee !== 'yes'){
                        this.messageSendToTypes = ['employee'];
                    }
				    else {
                        this.messageSendToTypes = ['employee', 'client'];
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
                console.log(this.employee)
				if (this.messageSendToType === 'employee') {
				    this.item.to = this.employee.id;
                }
				else {
                    this.item.to = this.client.id;
                }

				this.$http.post(`/userchat`,this.item).then((response) => {
					this.$f7.preloader.hide();
					Cache.removeMatching('userchat');
					this.$store.commit('sendCacheInvalidate', 'userchat');
					this.$f7router.back();
				}, () => {
					this.$f7.preloader.hide();
				});
			}
		}
	};
</script>
