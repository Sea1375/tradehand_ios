<template>
   <f7-page ptr @ptr:refresh="refresh" @page:init="pageLoad" id="task-list">
    <f7-navbar :sliding="false">
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title sliding>{{ trans('app.menu.dashboard') }}</f7-nav-title>
    </f7-navbar>
       <clocking v-snap-permission="'attendance'" ref="clockingref" v-if="this.isEmployeeRoute"></clocking>
       <attendance v-snap-permission="'attendance'" ref="attendanceref" v-else></attendance>

       <f7-card>
           <f7-card-content>
               <f7-row>
                   <f7-col width="20">
                       <f7-icon f7="layers_alt" class="bg-danger-gradient dashboard-widget-icon"></f7-icon>
                   </f7-col>
                   <f7-col width="50">
                       <span class="dashboard-widget-title">Total Projects</span>
                   </f7-col>
                   <f7-col width="30" class="text-align-right">
                       <f7-badge color="green">{{ totalProjects }}</f7-badge>
                   </f7-col>
               </f7-row>
           </f7-card-content>
       </f7-card>
       <f7-card>
           <f7-card-content>
               <f7-row>
                   <f7-col width="20">
                       <f7-icon f7="layers_alt" class="bg-success-gradient dashboard-widget-icon"></f7-icon>
                   </f7-col>
                   <f7-col width="50">
                       <span class="dashboard-widget-title">Pending Tasks</span>
                   </f7-col>
                   <f7-col width="30" class="text-align-right">
                       <f7-badge color="green">{{ pendingTasks }}</f7-badge>
                   </f7-col>
               </f7-row>
           </f7-card-content>
       </f7-card>
       <f7-card v-if="!this.userEmployeeRole">
           <f7-card-content>
               <f7-row>
                   <f7-col width="20">
                       <f7-icon f7="layers_alt" class="bg-warning-gradient dashboard-widget-icon"></f7-icon>
                   </f7-col>
                   <f7-col width="50">
                       <span class="dashboard-widget-title">Unpaid Invoices</span>
                   </f7-col>
                   <f7-col width="30" class="text-align-right">
                       <f7-badge color="green">{{ unpaidInvoices }}</f7-badge>
                   </f7-col>
               </f7-row>
           </f7-card-content>
       </f7-card>
  </f7-page>
</template>
<script>
import Attendance from './attendance'
import Clocking from './clocking'
import CommonMixin from "../assets/vue/mixins/common";
import IndexMixin from "../assets/vue/mixins/index";
import Cache from "../assets/vue/scripts/cache";
import _ from "lodash";

export default {
    mixins: [CommonMixin, IndexMixin],
    components: {
        Attendance,
        Clocking,
    },
    data() {
        return {
            currentPage: 1,
            infiniteScrollInProgress: false,
            infiniteScrollPreloader: false,
            totalProjects : 0,
            pendingTasks : 0,
            unpaidInvoices : 0,
            userEmployeeRole : false,
            photos: [
                'https://placekitten.com/1024/1024',
            ],
        };
    },
    mounted () {
        console.log('path'+this.$f7route.path)
        //
    },
    methods: {
        pageLoad (page) {
            this.init();
        },
        init () {
            this.userEmployeeRole = this.$store.state.user.user_other_role !== 'admin';
            !this.isEmployeeRoute ? this.$refs.attendanceref.init() : this.$refs.clockingref.loadData();
            let dashboardUrl = '/dashboard';
            if(this.isEmployeeRoute){
                dashboardUrl = '/dashboard/me';
            }
            this.$http.get(dashboardUrl).then((response) => {
                this.totalProjects = response.data.data.totalProjects;
                this.pendingTasks = response.data.data.pendingTasks;
                this.unpaidInvoices = response.data.data.unpaidInvoices;
            });
        },
        refresh () {
            this.init(true);
        },
   },
};
</script>
