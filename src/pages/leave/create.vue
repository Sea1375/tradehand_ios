
<template>
  	<f7-page @page:init="pageLoad">
	 	<f7-navbar :back-link="true" :title="getTitle()" sliding layout="light" theme="white" snapPageScrollToTransparentNavbar>
	 	</f7-navbar>
	 	<f7-block>
			<f7-card>
				<f7-card-content>

		  			<f7-list inset form @submit.prevent="false;" id="form">
			 			<f7-list-item v-if="!isEmployeeRoute" :title="trans('app.employee')" smart-select id="userSmartSelect"
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

			 			<f7-list-input
							:label="trans('modules.leaves.leaveType')"
							type="select"
							name="type"
							@change="onTypeChange"
							:placeholder="trans('app.select')+' '+trans('app.leaves')"
							>
							<option :value="type.id" v-for="type in types" :key="type.id">{{type.type_name}}</option>
						</f7-list-input>

						<f7-list-input v-if="!isEmployeeRoute"
							:label="trans('app.status')"
							type="select"
							name="status"
							@change="onStatusChange"
							:placeholder="trans('app.selectStatus')"
						>
							<option :value="singleStatus" v-for="singleStatus in status" :key="singleStatus">{{ formatStatus(singleStatus) }}</option>
						</f7-list-input>

						<f7-list-input
							:label="trans('modules.leaves.leaveDate')"
							clear-button
							type="datepicker"
							readonly
							:calendar-params="{dateFormat: getCompanyDatePickerFormat}"
							:placeholder="trans('modules.leaves.leaveDate')"
							@change="onStartDateChange($event.target.value)"
						></f7-list-input>

						<f7-list-input
							:label="trans('modules.leaves.reason')"
							floating-label
							required
							validate-on-blur
							clear-button
							autocorrect="off"
							type="textarea"
                            :error-message="trans('validation.required', trans('modules.leaves.reason'))"
							:placeholder="trans('modules.leaves.reason')"
							:value="item.reason"
							@input="item.reason = $event.target.value"
						></f7-list-input>

					</f7-list>
					<br>
					<br>
					<f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid">
                        {{ trans('app.submit') }}
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
					leave_date: null,
					user: {
						id: null,
					},
					type: {
						id: null,
					},
					reason: null,
					duration: 'single',
					status: 'pending',
				},
				users: [],
				types: [],
				status: ['approved', 'pending'],
				error: null,
				push: null,
			};
		},
		computed:{
			formValid() {
				const $$ = this.Dom7;
				return this.item.leave_date && this.item.status && this.item.type.id && this.item.reason && this.item.user.id && $$('#form')[0] && $$('#form')[0].checkValidity();
			},
		},
	 	methods:{

			init () {
				this.$f7.preloader.show();

				const promises = [];
				promises.push(this.getUsers());
				promises.push(this.getTypes());

				Promise.all(promises).then(() => {
					this.item.type =  this.types[0];
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
                if (this.isEmployeeRoute) {
                    this.item.user = this.$store.state.user;
                }
				this.$http.post(`/leave`,this.item).then((response) => {
					this.$f7.preloader.hide();
					Cache.removeMatching('leave');
					this.$store.commit('sendCacheInvalidate', 'leave');
					this.$f7router.back();
				}, () => {
					this.$f7.preloader.hide();
				});
			},
			getTitle(){
			   if(this.isEmployeeRoute){
			      return `${this.trans('modules.leaves.addLeave')}`;
            }
			   else{
			      return `${this.trans('modules.leaves.applyLeave')}`;
            }
         }
		}
	};
</script>
