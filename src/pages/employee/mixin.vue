<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';
    import moment from 'moment-timezone';

    export default {
        computed: {},
        methods: {
            /** Data getters **/
            getItem() {
                return this.$http.get(`/employee/${this.$f7route.params.id}?fields=${encodeURIComponent('id,name,email,image,image_url,status,pending_task,leaves_taken,projects_count,employeeDetail{id,employee_id},employeeDetail:department{id,team_name},employeeDetail:designation{id,name},user_other_role')}`).then((response) => {
                    this.item = response.data.data;
                });
            },
            getDepartments () {
                return Cache.httpGet('/department?fields=id,team_name&limit=1000').then((response) => {
                    this.departments = response.data;
                });
            },
            getDesignations () {
                return Cache.httpGet('/designation?fields=id,name&limit=1000').then((response) => {
                    this.designations = response.data;
                });
            },
            getEmployeeId () {
                return this.$http.get('/employee/last-employee-id').then((response) => {
                    console.log(response.data.data.id);
                    this.item.employee_detail.employee_id = (response.data.data.id*1)+1;
                });
            },
            /** Formatters **/
            formatStatus(item) {
                return this.capitalize(item.status);
            },
           formatSheetStatus(status) {
                return this.capitalize(status);
            },
            onBillDateChange(date) {
                if (date) {
                    let momentDate = moment(date, this.getCompanyMomentDateFormat);
                    this.item.employee_detail.joining_date = momentDate.format('YYYY-MM-DD');
                }
            },

            onDepartmentChange (event) {
                const id = event.target.value * 1;
                this.item.employee_detail.department = _.find(this.departments, (item) => item.id === id);
            },
            onDesignationChange (event) {
                const id = event.target.value * 1;
                this.item.employee_detail.designation = _.find(this.designations, (item) => item.id === id);
            },
           onStatusChange (event) {
              this.item.status = event.target.value;
           },
            formatStatusColor(item) {
                if (item.status === 'active') {
                    return 'green';
                } else if (item.status === 'deactive') {
                    return 'red';
                }
            },
           formatSheetStatusColor(status) {
                if (status === 'active') {
                    return 'green';
                } else if (status === 'deactive') {
                    return 'red';
                }
            },

        },
    }
</script>
