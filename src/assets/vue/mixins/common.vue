<template>
    <f7-photo-browser
            :photos="images"
            type="popup"
            theme="dark"
            :toolbar="false"
            ref="popup"
    ></f7-photo-browser>
</template>
<script type="text/babel">
    import moment from 'moment-timezone';
    export default {
        data() {
            return {
                images:[],
                textEditorButtons: [
                    ['bold', 'italic', 'underline'],
                    ['orderedList', 'unorderedList'],
                    ['alignLeft', 'alignCenter', 'alignRight']
                ],
            };
        },
        methods: {
            handleClick(e) {
                this.images = [];
                if (e.target.matches('img')) {
                    this.images.push(e.target.src);
                    setTimeout(() => {
                        this.$refs.popup.open();
                    }, 100);

                }
            },
            capitalize(str) {
                if (str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                } else {
                    return str;
                }
            },
            moment(date) {
                if (date) {
                    let momentDate = moment(date);
                    return momentDate;
                }moment(date).format('MMM DD YYYY');
            },
            removePtrClass (){
                this.$f7.ptr.done();
                let active = document.querySelectorAll(".ptr-content");
                for (let i = 0; i < active.length; i++) {
                    active[i].classList.remove("ptr-refreshing");
                    active[i].classList.remove("ptr-pull-up");
                    active[i].classList.remove("ptr-transitioning");
                }
            },
            formatBadgeSubtitle(employee) {
                return ((employee.designation) ? employee.designation.name : '') + ((employee.location && employee.designation) ? ', ' : '') + ((employee.location) ? employee.location.name : '');
            },
            onPageBeforeOut() {
                const self = this;
                self.$f7.sheet.close();
            },
            onPageBeforeRemove() {
                const self = this;
                if (self.sheet) self.sheet.destroy();
            },
            trans: function (key, attribute = null) {
                let translatedString = '';
                translatedString = _.get(this.$store.state.translation, `${key}`) ? _.get(this.$store.state.translation, `${key}`) : key;
                if (attribute !== null) {
                    translatedString = translatedString.replace(":attribute", attribute);
                }
                return translatedString;
            },
            applicationName() {
                return this.$store.state.version.hasOwnProperty('worksuite-saas') ? 'worksuite-saas' : 'worksuite';
                // return _.get(this.$store.state.version, `application`);
            },
        },
       computed: {
          isEmployeeRoute () {
             return this.$f7route.path.indexOf('self') !== -1;
          },
           getCompanyDatePickerFormat() {
              let dateFormat = 'dd MM yyyy';
               if(this.$store.state.company.date_picker_format !== null) {
                   dateFormat = this.$store.state.company.date_picker_format;
               }
               return dateFormat;
           },
           getCompanyMomentDateFormat() {
              let dateFormat = 'dd MM yyyy';
               if(this.$store.state.company.moment_date_format !== null) {
                   dateFormat = this.$store.state.company.moment_date_format;
               }
               return dateFormat;
           },
           getCompanyTimezone() {
               let timezone = 'Asia/Kolkata';
               if(this.$store.state.company.timezone !== null) {
                   timezone = this.$store.state.company.timezone;
               }
               return timezone;
           }
       }


    }
</script>
