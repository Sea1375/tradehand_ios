<style type="text/css">

</style>
<template>
   <f7-card class="dashboard-card">
      <f7-card-header class="color-white text-color-white bg-color-orange">{{ trans('app.todaysAttendance') }}
         <f7-icon f7="alarm"></f7-icon>
      </f7-card-header>
      <f7-card-content>
         <p><strong>{{ trans('modules.attendance.present') }} ({{ presentCount }})</strong></p>
         <f7-progressbar :progress="present" color="green" class="attendance-progress"></f7-progressbar>

         <p><strong>{{ trans('modules.attendance.absent') }} ({{ absentCount }})</strong></p>
         <f7-progressbar :progress="absent" color="red" class="attendance-progress"></f7-progressbar>

      </f7-card-content>
      <f7-card-footer><f7-link href="/attendance" :ignore-cache="false">{{ trans('modules.attendance.viewFullAttendance') }}</f7-link></f7-card-footer>
   </f7-card>
</template>
<script type="text/babel">
    import moment from 'moment';
    import Cache from '../assets/vue/scripts/cache';
    import CommonMixin from "../assets/vue/mixins/common";

    export default {
        mixins: [CommonMixin],
        data() {
            return {
               employees: [],
               attendances: [],
            };
        },
        methods: {
           init () {
              this.$f7.preloader.show();

              const promises = [];
              promises.push(this.getEmployees());
              promises.push(this.getTodayAttendance());

              Promise.all(promises).then(() => {
                 // console.log(this.item);
                 // this.item.project = _.find(this.projects, (item) => item.id === id)
                 this.$f7.preloader.hide();
                 this.removePtrClass();
              }, () => {
                 this.$f7.preloader.hide();
                 this.removePtrClass();
              });
           },
           getEmployees () {
              return Cache.httpGet('/employee?fields=id,name,email,status,image,image_url,employeeDetail{id,employee_id}&limit=1000&filters=status eq "active"').then((response) => {
                 this.employees = response.data;
              });
           },

           getTodayAttendance () {
              const date = moment().format('YYYY-MM-DD');

              return this.$http.get(`/attendance?fields=${ encodeURIComponent('id,user{id,name,image,image_url}') }&filters=clock_in_time lk "${ date }%"&limit=1000`).then((response) => {
                 this.attendances = response.data.data;
              });
           },
           refresh () {
              this.init(true);
           },

           moment (date) {
              return moment(date);
           },
           removePtrClass (){
              let active = document.querySelectorAll(".ptr-content");
              for (let i = 0; i < active.length; i++) {
                 active[i].classList.remove("ptr-refreshing");
                 active[i].classList.remove("ptr-pull-up");
                 active[i].classList.remove("ptr-transitioning");
              }
           },

        },
        mounted() {
           this.init();
        },
       computed: {
          present () {
             if (this.employees.length > 0) {
                return Math.round(this.attendances.length / this.employees.length * 100);
             }
             else {
                return 0;
             }
          },

          presentCount () {
             if (this.employees.length > 0) {
                return this.attendances.length;
             }
             else {
                return 0;
             }
          },

          absent () {
             if (this.employees.length > 0) {
                return Math.round((this.employees.length - this.attendances.length) / this.employees.length * 100);
             }
             else {
                return 0;
             }
          },

          absentCount () {
             if (this.employees.length > 0) {
                return (this.employees.length - this.attendances.length);
             }
             else {
                return 0;
             }
          },

   }
};
</script>
