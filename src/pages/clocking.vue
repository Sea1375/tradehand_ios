<style type="text/css">

</style>
<template>
    <f7-card class="dashboard-card">
        <f7-card-header class="color-white text-color-white bg-color-orange">{{ trans('app.todaysAttendance') }}
            <f7-icon f7="alarm"></f7-icon>
        </f7-card-header>
        <f7-card-content>
            <div v-if="error && error.innererror && (error.innererror.code === 2000 || error.innererror.code === 2001)">
                {{ error.message }}
            </div>

            <f7-list media-list v-if="error === null">
                <f7-list-item :title="trans('modules.attendance.ipAddress')" :after="todayAttendance.ip_address">
                </f7-list-item>
                <f7-list-item :title="trans('app.time')" :after="currentTime.format('LTS')">
                </f7-list-item>
                <template v-if="todayAttendance.attendance">


                    <f7-list-item :title="trans('modules.attendance.clockedIn')"
                                  :after="moment(todayAttendance.attendance.clock_in_time).format('LT')"
                                  v-if="clocked_in">
                    </f7-list-item>
                    <f7-list-item :title="trans('modules.attendance.clockedOut')"
                                  :after="moment(todayAttendance.attendance.clock_out_time).format('LT')"
                                  v-if="clocked_out">
                    </f7-list-item>
                </template>
                <f7-list-item>
                    {{ trans('modules.attendance.working_from') }}
                    <f7-input type="text" :placeholder="trans('modules.attendance.workFrom')" :value="working_from"/>
                </f7-list-item>
            </f7-list>
        </f7-card-content>
        <f7-card-footer
                v-if="error === null && (todayAttendance.office_hours_passed === false && todayAttendance.attendance === null || todayAttendance.attendance && todayAttendance.attendance.status !== 'absent') && remainingClockIn > 0">
            <f7-button :fill="true" color="blue" @click="clockIn()" :disabled="busy || clocked_in">{{ (clocked_in) ?
                trans('modules.attendance.clockedIn') : trans('modules.attendance.clock_in')}}
            </f7-button>
            <f7-button :fill="true" color="red" @click="clockOut()" :disabled="busy || !clocked_in || clocked_out">{{
                (clocked_out) ? trans('modules.attendance.clockedOut') : trans('modules.attendance.clock_out')}}
            </f7-button>
        </f7-card-footer>
       <f7-block v-if="remainingClockIn === 0">
           {{ trans('modules.attendance.maxColckIn') }}
       </f7-block>
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
                todayAttendance: {},
                error: null,
                currentTime: moment(),
                diffFromLocalTime: 0, // Diff in seconds from local time. We use this difference to add to current local time to display clock,
                working_from: null,
                remainingClockIn:'',
                busy: false,
            };
        },
        methods: {
            clockIn() {
                this.$f7.preloader.show();

                const data = {
                    working_from: this.working_from,
                };

                this.$http.post('/attendance/clock-in', data).then((response) => {
                    this.$f7.preloader.hide();
                    Cache.removeMatching('attendance');
                    this.loadData();
                }, () => {
                    this.$f7.preloader.hide();
                });
            },
            clockOut() {
                this.$f7.preloader.show();

                const data = {
                    working_from: this.working_from,
                };

                this.$http.post(`/attendance/clock-out/${this.todayAttendance.attendance.id}`, data).then((response) => {
                    this.$f7.preloader.hide();
                    Cache.removeMatching('attendance');
                    this.loadData();
                }, () => {
                    this.$f7.preloader.hide();
                });
            },
            getTodayAttendance() {
               // this.$http.get(`${domain}/api/v1/app`).then((response) => {
               //    self.$f7.preloader.hide();
               //    if (typeof response.data === 'object') {
               //       this.$store.commit('updateHost', `${domain}`);
               //       this.$store.commit('updateCompany', response.data.data);
               //       this.error = null;
               //    } else {
               //       this.error = {
               //          code: 1,
               //       };
               //    }
               // }, (response) => {
               //    self.$f7.preloader.hide();
               //    this.error = response.data.error;
               // });
                return this.$http.get('/attendance/today').then((response) => {
                    this.todayAttendance = response.data.data;
                    this.currentTime = moment(this.todayAttendance.time);
                    this.remainingClockIn = this.todayAttendance.remaining_clock_in;
                    this.diffFromLocalTime = this.currentTime.diff(moment(), 'seconds');

                    if (this.todayAttendance.attendance) {
                        this.working_from = this.todayAttendance.attendance.working_from;
                    }

                    // Set clock ticking
                    setInterval(() => {
                        this.currentTime = moment().add(this.diffFromLocalTime, 'seconds');
                    }, 1000);
                }, (response) => {
                   console.log('error',response);
                    this.error = response.data.error;
                });
            },

            loadData() {
               this.$f7.preloader.show();

                const promiseArray = [];
                this.busy = true;
                this.error = null;

                promiseArray.push(this.getTodayAttendance());

                Promise.all(promiseArray).then(() => {
                   this.$f7.preloader.hide();
                   this.removePtrClass();
                    this.busy = false;
                }, () => {
                   this.$f7.preloader.hide();
                   this.removePtrClass();
                    this.busy = false;
                });
            },

            moment(date) {
                return moment(date);
            },

            duration(duration) {
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;

                if (hours === 0) {
                    return `${minutes} mins`;
                } else {
                    return `${hours} hrs ${minutes} mins`;
                }
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
        computed: {
            clocked_in() {
                return this.todayAttendance.attendance !== null;
            },
            clocked_out() {
                return this.todayAttendance.attendance !== null && this.todayAttendance.attendance.clock_out_time !== null;
            },
        },
        mounted() {
            this.loadData();
        },
    };
</script>
