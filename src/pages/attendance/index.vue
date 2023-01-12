<style type="text/css" scoped>
#selected{
   background-color: rgba(0, 0, 0, 0.15);
}
</style>
<template>
   <f7-page ptr @ptr:refresh="refresh" @page:init="pageLoad" id="task-list">
      <!-- Top Navbar -->
      <f7-navbar :sliding="false" >
         <f7-nav-left>
            <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
         </f7-nav-left>
         <f7-nav-title>{{ trans('app.menu.attendance') }} ({{ moment(selectedDate).format('DD MMM') }})</f7-nav-title>
         <f7-nav-right>
            <f7-link href="#" @click.prevent="selectDate" icon-f7="calendar"></f7-link>
         </f7-nav-right>
         <f7-sheet :opened="datepickerOpen" ref="datepicker" class="picker-calendar">
            <f7-link href="#" @click.prevent="selectDate" icon-f7="calendar"></f7-link>
            <f7-input
                type="hidden"
                readonly="readonly"
                id="demo-calendar-default"/>
         </f7-sheet>
      </f7-navbar>

      <f7-toolbar tabbar theme="orange" position="top"  v-if="$store.state.user.user_other_role !=='employee'">
         <f7-button :tab-link="'#absent' + pageId" active tab-link-active>Absent ({{ totalAbsent }})</f7-button>
         <f7-button :tab-link="'#present' + pageId">Present ({{ totalPresent }})</f7-button>
      </f7-toolbar>
      <f7-tabs>
         <f7-tab :id="'absent' + pageId" tab-active>
            <f7-block v-if="!busy && notMarked.length === 0" style="text-align: center;">
                {{ trans('modules.attendance.everyonePresent') }}
            </f7-block>
            <f7-list media-list inset id="employee" class="search-list searchbar-found">
               <f7-list-item
                   swipeout
                   link="#"
                   v-for="item in notMarked"
                   v-bind:key="item.id"
                   :title="item.name"
                   :subtitle="formatSubtitle(item.employee_detail)"
                   @click="show(item)"
               >
                  <img
                      slot="media"
                      :src="item.image_url"
                      width="44"
                      height="44"
                      class="lazy lazy-fade-in"
                  />
               </f7-list-item>

            </f7-list>
         </f7-tab>
         <f7-tab :id="'present' + pageId">
            <f7-block v-if="!busy && notMarked.length === 0" style="text-align: center;">
               {{ trans('messages.noAttendanceDetailTOday') }}
            </f7-block>
            <f7-list media-list inset id="employee-list" class="search-list searchbar-found">
               <f7-list-item
                   swipeout
                   link="#"
                   v-for="item in present"
                   v-bind:key="item.id"
                   :title="item.user.name"
                   :subtitle="formatSubtitle(item.user.employee_detail)"
                   @click="show(item)"
               >
                  <img
                      slot="media"
                      :src="item.user.image_url"
                      width="44"
                      height="44"
                      class="lazy lazy-fade-in"
                  />
               </f7-list-item>

            </f7-list>
         </f7-tab>
      </f7-tabs>

   </f7-page>
</template>

<script type="text/babel">
import CommonMixin from '../../assets/vue/mixins/common';
import moment from 'moment';
import Cache from "../../assets/vue/scripts/cache";

export default {
   mixins: [CommonMixin],
   data () {
      return {
         calender: '',
         busy: false,
         employeeList: [],
         presentEmployees: [],
         selectedDate: new Date(),
         datepickerOpen: false,
         filters:'',
         pageId: 1, // This is to change tab ids, because tab links do not work because of page caching
      };
   },
   created () {
      this.pageId = Math.round(Math.random() * 100);
   },
   mounted () {
   },
   methods: {
      pageLoad (page) {
         this.init();
      },
      init () {
         this.$f7.preloader.show();

         const promises = [];
         promises.push(this.getEmployees());
         promises.push(this.getPresentEmployees());
         promises.push(this.initCalendar());

         Promise.all(promises).then(() => {
            this.$f7.preloader.hide();
            this.removePtrClass();
         }, () => {
            this.$f7.preloader.hide();
            this.removePtrClass();
         });
      },
      refresh () {
         this.init();
      },
      removePtrClass (){
         let active = document.querySelectorAll(".ptr-content");
         for (let i = 0; i < active.length; i++) {
            active[i].classList.remove("ptr-refreshing");
            active[i].classList.remove("ptr-pull-up");
            active[i].classList.remove("ptr-transitioning");
         }
      },

      getEmployees () {
         return Cache.httpGet(`/employee?fields=${encodeURIComponent('id,name,image,image_url,employeeDetail.limit(1000){id,employee_id},employeeDetail:designation.limit(1000){id,name},employeeDetail:department.limit(1000){id,team_name}')}&filters=status eq "active"&limit=1000`).then((response) => {
            this.employeeList = response.data;
         });
      },
      getPresentEmployees () {
         return Cache.httpGet(`/attendance?fields=${encodeURIComponent('id,clock_in_date,clock_in_time,user.limit(1000){id,name,email,status,image,image_url},user:employeeDetail.limit(1000){id,employee_id},user:employeeDetail:designation.limit(1000){id,name},user:employeeDetail:department.limit(1000){id,team_name}')}&filters=clock_in_time lk "${ moment(this.currentDate).format('YYYY-MM-DD') }%"&limit=1000`).then((response) => {
            this.presentEmployees = response.data;
         });
      },
      selectDate () {
         this.calender.open();
      },
      moment (date) {
         return moment(date);
      },
      initCalendar () {
         this.calender = this.$f7.calendar.create({
            inputEl: '#demo-calendar-default',
            openIn: 'customModal',
            header: true,
            footer: true,
            closeOnSelect: true,
            on: {
               change: this.setDate,
            }
         })
      },
      setDate (c, val) {
         this.selectedDate = val[0],
             this.init();
      },
      getFilters () {
         let filters = '';
         const date = moment(this.selectedDate).format('YYYY-MM-DD');
         filters += `clock_in_time lk "${ this.currentDate }%" and`;

         // Remove trailing 'and' and encode for URI
         filters = encodeURIComponent(this.filters.substring(0, this.filters.length - 4));

         return filters;
      },
      formatSubtitle(employee){
         return ((employee.designation) ? employee.designation.name: '') + ((employee.department && employee.designation) ? ', ' : '') + ((employee.department) ? employee.department.team_name: '');
      },
      show(item) {
         this.$f7router.navigate(('/employee/' + item.id));
      },
   },
   computed:{
      present () {
         return this.presentEmployees;
      },
      totalPresent() {
         return this.presentEmployees.length;
      },
      notMarked () {
         const marked = _.map(this.presentEmployees, (item) => item.user.id);
         return _.filter(this.employeeList, (item) => marked.indexOf(item.id) === -1);
      },
      totalAbsent () {
         const marked = _.map(this.presentEmployees, (item) => item.user.id);
         return _.filter(this.employeeList, (item) => marked.indexOf(item.id) === -1).length;
      },
      currentDate() {
         return this.selectedDate;
      }
   }
};
</script>
