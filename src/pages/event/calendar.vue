<style type="text/css">
    .invisible {
        visibility: hidden;
    }
    .calendar-day.calendar-day-selected .calendar-day-number {
        color: var(--f7-calendar-selected-text-color);
        background-color: #f8c233;
    }
    .calendar-day.picker-calendar-day-has-events span:before {
        background-color: #f8c233;
        transform: translateX(-50%);
        border-radius: 100%;
        position: absolute;
        bottom: 0px;
        height: 8px;
        content: '';
        width: 8px;
        left: 50%;
    }

    .android .calendar-custom-toolbar {
        top: 0;
    }

</style>
<template>
    <f7-page ptr @ptr:refresh="loadData(true)" class="bg-white calender" @page:beforein="init">
        <f7-navbar :sliding="false" >
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title sliding>{{ trans('app.menu.calendar') }}</f7-nav-title>
        </f7-navbar>


        <template class="no-padding medium-inset">
            <div id="calendar-inline-container"></div>
        </template>
            <f7-list media-list class="no-margin">
                <f7-list-item v-for="(item,index) in selectedDateEvents"
                    v-bind:key="index"
                    :title="item.title"
                    :badge="capitalize(item.type)"
                    :badge-color="item.color"
                    :link="formatLink(item)"
                    >
                    </f7-list-item>
                </f7-list>
        <!-- </f7-block> -->
    </f7-page>
</template>

<script>
    import moment from 'moment';
    import Cache from '../../assets/vue/scripts/cache';
    import Vue from 'vue';

    import CommonMixin from '../../assets/vue/mixins/common';

    export default {
        mixins: [CommonMixin],
        data () {
            return {
                rawEvents: {
                    events: [],
                    holidays: [],
                    leaves: [],
                    birthdays: [],
                    interviews: [],
                    anniversaries: [],
                },

                style: this.$theme.ios ? 'background:#fff; margin:-10px -15px' : 'background:#fff; margin:-16px -16px',
                currentYear: moment().get('Y'),
                currentMonth: moment().get('M'),
                startMonth: moment().get('M'),
                calendarInline:'',
                selectedDate: moment().format('YYYY-MM-DD'),
            };
        },
        mounted () {
        },
        methods: {
            onPageInit(e) {

                console.log('onPageInit');
                const self = this;
                const app = self.$f7;
                const $ = self.$$;
                // Inline with custom toolbar
                const monthNames = [
                    this.trans('app.months.January'),
                    this.trans('app.months.February'),
                    this.trans('app.months.March'),
                    this.trans('app.months.April'),
                    this.trans('app.months.May'),
                    this.trans('app.months.June'),
                    this.trans('app.months.July'),
                    this.trans('app.months.August'),
                    this.trans('app.months.September'),
                    this.trans('app.months.October'),
                    this.trans('app.months.November'),
                    this.trans('app.months.December')
                ];

                console.log(monthNames);
                console.log(self.calendarInline);
                // self.calendarInline !== '' ? self.calendarInline.destroy() : '';
                // self.calendarInline.destroy();
                if(self.calendarInline === ''){
                    self.calendarInline = app.calendar.create({
                        containerEl: '#calendar-inline-container',
                        value: [new Date()],
                        weekHeader: false,
                        renderToolbar: function () {
                            return '<div class="toolbar calendar-custom-toolbar">\n' +
                                '                <div class="toolbar calendar-custom-toolbar no-shadow">\n' +
                                '                    <div class="toolbar-inner">\n' +
                                '                        <div class="left">\n' +
                                '                            <a href="#" class="link icon-only"><i class="icon icon-back"></i></a>\n' +
                                '                        </div>\n' +
                                '                        <div class="center"></div>\n' +
                                '                        <div class="right">\n' +
                                '                            <a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>\n' +
                                '                        </div>\n' +
                                '                    </div>\n' +
                                '                </div>\n' +
                                '\n' +
                                '            </div>';
                        },
                        on: {
                            init(c) {
                                console.log('calendar draw');
                                $('.calendar-custom-toolbar .center').text(`${monthNames[c.currentMonth]}, ${c.currentYear}`);
                                $('.calendar-custom-toolbar .left .link').on('click', () => {
                                    self.calendarInline.prevMonth();
                                    // this.addEventDots();
                                });
                                $('.calendar-custom-toolbar .right .link').on('click', () => {
                                    self.calendarInline.nextMonth();
                                    // this.addEventDots();
                                });
                            },
                            monthYearChangeStart(c) {
                                $('.calendar-custom-toolbar .center').text(`${monthNames[c.currentMonth]}, ${c.currentYear}`);
                            },

                            change(calender, dates) {
                                self.selectedDate = moment(dates[0]).format('YYYY-MM-DD');
                            },
                        },
                    });
                }

            },
            init () {
                console.log('init');
                this.onPageInit();
                this.loadData();
            },

            loadData (force) {
                console.log('loadData');
                if (force) {
                    Cache.removeMatching('me/calendar');
                }

                // force means we are doing pull down to refresh
                if (!force) {
                    this.$f7.preloader.show();
                }

                Promise.all([this.loadEvents()]).then((result) => {
                    if (!force) {
                        this.$f7.preloader.hide();
                    }

                    this.$f7.ptr.done();
                }, (result) => {
                    if (!force) {
                        this.$f7.preloader.hide();
                    }
                    this.$f7.ptr.done();
                });
            },
            loadEvents () {
                return Cache.httpGet('/me/calendar').then((response) => {
                    this.rawEvents = response.data;
                    Vue.nextTick(() => {
                        this.addEventDots();
                    });
                }, (reason) => {
                    //
                });
            },
            addEventDots () {
                document.querySelectorAll('.calendar-day').forEach((item) => {
                    item.classList.remove('picker-calendar-day-has-events');
                });


                this.events.forEach((item) => {
                    const start = moment(item.start);
                    const end = moment(item.end);
                    while (start.isSameOrBefore(end, 'day')) {

                        // if (start.get('M') === this.currentMonth) {
                            try {
                                document.querySelector(`[data-date="${ start.get('Y') }-${ start.get('M') }-${ start.get('D') }"]`).classList.add('picker-calendar-day-has-events');
                            }
                            catch(e) {}
                        // }
                        start.add(1, 'day');
                    }
                });
            },
            onChange(calender, dates) {
                this.selectedDate = moment(dates[0]).format('YYYY-MM-DD');
            },
            onMonthYearChangeStart (p, year, month) {
                this.currentYear = year;
                this.currentMonth = month;
                this.selectedDate = null;

                Vue.nextTick(() => {
                    this.addEventDots();
                });
            },
            onMonthYearChangeEnd (p, year, month) {
                //
            },
            moment (date) {
                return moment(date);
            },
            formatLink (item) {
                if (item.type === 'event') {
                    return `/event/${ item.id }`;
                }
                return null;
            }
        },
        computed: {

            startYear () {
                if (moment().get('M') < this.startMonth) {
                    return moment().get('Y') - 1;
                }
                else {
                    return moment().get('Y');
                }
            },
            startDate () {
                return moment().year(this.startYear)
                        .month(this.startMonth)
                        .startOf('month')
                        .toDate();
            },
            endDate () {
                return moment(this.startDate).add(1, 'year')
                        .subtract(1, 'day')
                        .toDate();
            },
            events () {
                const eventArray = [];

                this.rawEvents.events.forEach((data) => {
                    let color;
                    color = 'green';

                    eventArray.push({
                        title: data.event_name,
                        start: data.start_date_time,
                        end: data.end_date_time,
                        type: 'event',
                        allDay: 1,
                        color,
                        icon: 'zmdi-sun',
                        id: data.id,
                    });
                });

                this.rawEvents.holidays.forEach((data) => {
                    let color;

                    color = 'red';

                    eventArray.push({
                        title: data.occassion,
                        start: data.date,
                        end: data.date,
                        type: 'holiday',
                        allDay: 1,
                        color,
                        icon: 'zmdi-sun',
                        id: data.id,
                    });
                });
                return eventArray;
            },
            selectedDateEvents () {
                if (this.selectedDate === null) {
                    return [];
                }

                const selectedDate = moment(this.selectedDate);

                return _.filter(this.events, (item) => {
                    return selectedDate.isBetween(item.start, item.end,'days', '[]');
                });
            }
        }
    }
</script>
