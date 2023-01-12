<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';
    import moment from 'moment-timezone';

    export default {
        computed: {
           selfUrl () {
              let self_url = '/leave/';
              if (this.isEmployeeRoute) {
                 self_url = '/self' + self_url;
              }
              return self_url;
           }
        },
        methods: {
            /** Data getters **/
            getItem() {
                return this.$http.get(`/leave/${this.$f7route.params.id}?fields=${encodeURIComponent('id,leave_date,status,reason,reject_reason,user.limit(1000){id,name,image,image_url},type.limit(1000){id,type_name}')}`).then((response) => {
                    this.item = response.data.data;
                });
            },
            getUsers() {
                return this.$http.get(`/employee?limit=1000&filters=status eq "active"`).then((response) => {
                    this.users = response.data.data;
                });
            },
            getTypes() {
                return this.$http.get(`/leave-type?limit=1000`).then((response) => {
                    this.types = response.data.data;
                });
            },

            /** Formatters **/
            formatStatus(item) {
                return this.capitalize(item);
            },
            onStartDateChange(date) {
                if (date) {
                    let momentDate = moment(date, this.getCompanyMomentDateFormat);
                    this.item.leave_date = momentDate.format('YYYY-MM-DD');
                }
            },
            onStatusChange (event) {
                this.item.status = event.target.value;
            },
            onUserChange (event) {
                const id = event.target.value * 1;
                this.item.user = _.find(this.users, (item) => item.id === id);
            },
            onTypeChange (event) {
                const id = event.target.value * 1;
                this.item.type = _.find(this.types, (item) => item.id === id);
            },
            formatStatusColor(item) {
                if (item.status === 'approved') {
                    return 'green';
                } else if (item.status === 'rejected') {
                    return 'red';
                } else if (item.status === 'pending') {
                    return '#ffcc00';
                }
            },
            formatSheetStatusColor(status) {
                if (status === 'approved') {
                    return 'green';
                } else if (status === 'rejected') {
                    return 'red';
                } else if (status === 'pending') {
                    return 'yellow';
                }
            },
            formatDueDate(date) {
                if(date){
                    return moment(date).format(this.getCompanyMomentDateFormat);
                }
                return  ''
            },

        },
    }
</script>
