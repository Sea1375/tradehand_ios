
<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="`${trans('app.timer')}`" sliding layout="light" theme="white" snapPageScrollToTransparentNavbar>
        </f7-navbar>
        <f7-block>
            <f7-card v-if="!timelog">
                <f7-card-content>
                    
                    <f7-list inset form @submit.prevent="false;" id="form">
                        
                        <f7-list-item :title="trans('app.project')" id="projectSmartSelect" smart-select
                                      @change="onProjectChange"
                                      :smart-select-params="{openIn: 'popup', closeOnSelect:true, searchbar: true, searchbarPlaceholder: trans('app.search')}" >
                            <select name="project" @change="onProjectChange">
                                <option :value="project.id" v-for="project in projects" :key="project.id" >{{project.project_name}}</option>
                            </select>
                        </f7-list-item>
    
                        <f7-list-item :title="trans('app.task')" id="taskSmartSelect" smart-select
                                      @change="onTaskChange"
                                      :smart-select-params="{openIn: 'popup', closeOnSelect:true, searchbar: true, searchbarPlaceholder: trans('app.search')}" >
                            <select name="requester" @change="onTaskChange">
                                <option :value="task.id" v-for="task in tasks" :key="task.id" >{{task.heading}}</option>
                            </select>
                        </f7-list-item>
                        
                        <f7-list-input
                            :label="trans('modules.timeLogs.memo')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            autocorrect="off"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.timeLogs.memo'))"
                            :placeholder="trans('modules.timeLogs.memo')"
                            :value="item.memo"
                            @input="item.memo = $event.target.value"
                        ></f7-list-input>
                    
                    </f7-list>
                    <br>
                    <br>
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit" :disabled="!formValid">
                        {{ trans('modules.timeLogs.startTimer') }}
                    </f7-button>
                </f7-card-content>

                <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0">{{ trans('messages.internetConnectionError') }}
                </f7-block>
                <f7-block class="error-block" v-if="error">{{ error }}
                </f7-block>
            </f7-card>
            <f7-card v-else class="dashboard-card">
                <f7-card-header class="color-white text-color-white bg-color-orange">{{ trans('app.timer') }}
                    <f7-icon f7="alarm"></f7-icon>
                </f7-card-header>
                <f7-card-content>
                    <f7-list media-list v-if="error === null">
                        <f7-list-item :title="trans('app.task')" :after="timelogData.task.heading">
                        </f7-list-item>
                        <f7-list-item :title="trans('modules.timeLogs.memo')" :after="timelogData.memo">
                        </f7-list-item>
                        <f7-list-item :title="trans('app.time')" id="currentTimer" :after="getTimer">
                        </f7-list-item>
                    </f7-list>
                    <br>
                    <br>
                    <f7-button fill color="green" class="login-btn" large raised round @click="update" :disabled="!formValid">
                        {{ trans('modules.timeLogs.stopTimer') }}
                    </f7-button>
                </f7-card-content>

            <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0">{{ trans('messages.internetConnectionError') }}
            </f7-block>
            <f7-block class="error-block" v-if="error">{{ error }}
            </f7-block>
          </f7-card>
        </f7-block>
    </f7-page>
</template>

<script type="text/babel">
import Cache from '../../assets/vue/scripts/cache';
import CommonMixin from '../../assets/vue/mixins/common';
import ModuleMixin from './mixin';
import moment from "moment";

export default {
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            item: {
                memo: null,
                project: {
                    id: 1,
                },
                task: {
                    id: null,
                },
            },
            existingTimer: false,
            projects: [],
            tasks: [],
            timelog: false,
            currentTime: null,
            timelogData: null,
            intervalTimer: null,
            error: null,
            push: null,
        };
    },
    computed:{
        formValid() {
            const $$ = this.Dom7;
            // return this.item.task.id && $$('#form')[0] && $$('#form')[0].checkValidity();
            return true;
        },
        getTimer() {
            return this.currentTime;
        },
    },
    methods:{
        
        init () {

            this.$f7.preloader.show();
            
            const promises = [];
            promises.push(this.getProjects());
            promises.push(this.getTasks());
            promises.push(this.getMyTimer());

            Promise.all(promises).then(() => {

                // this.item.type =  this.projects[0];
                // let projectSmartSelect = this.$f7.smartSelect.get('#projectSmartSelect .smart-select');
                // projectSmartSelect.setValue(this.item.type.id);
    
                this.item.task =  this.tasks[0];
                let taskSmartSelect = this.$f7.smartSelect.get('#taskSmartSelect .smart-select');
                taskSmartSelect.setValue(this.item.task.id);

                this.loadTimer();
                
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
            
            this.$http.post(`/timelog`,this.item).then((response) => {
                const promises = [];
                promises.push(this.getMyTimer());
                Promise.all(promises).then(() => {
                    this.loadTimer();
                }, () => {
                });
                this.$f7.preloader.hide();
                Cache.removeMatching('timelog');
                this.$store.commit('sendCacheInvalidate', 'timelog');
                // this.$f7router.back();
            }, (response) => {
              this.$f7.preloader.hide();
              if (response.data.error.innererror.code === 2001){
                this.error = response.data.error.message;
              }
            });
        },

        update (){
            this.$f7.preloader.show();
            const itemToSend = {
                id: this.timelogData ? this.timelogData.id : 0,
            };
            if (itemToSend.id === 0){
                return false;
            }
    
            this.$http.put(`/timelog/${itemToSend.id}`,itemToSend).then((response) => {
                this.timelog = false;
                this.timelogData = null;
                clearInterval(this.intervalTimer);
                this.$f7.preloader.hide();
                Cache.removeMatching('timelog');
                this.$store.commit('sendCacheInvalidate', 'timelog');
            }, () => {
                this.$f7.preloader.hide();
            });
        },

        loadTimer() {
            // console.log(this.timelogData.id, this.timelogData.length);
            if (this.timelogData.length !== 0) {
                this.currentTime = this.timelogData.timer;

                this.intervalTimer = setInterval(() => {
                    this.updateTimer();
                }, 1000);

                this.timelog = true;
            }
        },

        updateTimer() {
            var myTime = this.currentTime;
            var ss = myTime.split(":");

            var hours = ss[0];
            var mins = ss[1];
            var secs = ss[2];
            secs = parseInt(secs)+1;

            if(secs > 59){
                secs = '00';
                mins = parseInt(mins)+1;
            }

            if(mins > 59){
                secs = '00';
                mins = '00';
                hours = parseInt(hours)+1;
            }

            if(hours.toString().length < 2) {
                hours = '0'+hours;
            }
            if(mins.toString().length < 2) {
                mins = '0'+mins;
            }
            if(secs.toString().length < 2) {
                secs = '0'+secs;
            }
            var ts = hours+':'+mins+':'+secs;

            this.currentTime = ts;
        }
    }
};
</script>
