<script type="text/babel">

    export default {
        computed: {
            selfUrl () {
                let self_url = '/ticket/';
                if (this.isEmployeeRoute) {
                    self_url = '/self' + self_url;
                }
                return self_url;
            }
        },
        methods: {
            /** Data getters **/
            getItem() {
                // return this.$http.get(`/ticket/${this.$f7route.params.id}?fields=${encodeURIComponent('id,subject,priority,created_at,status,requester.limit(1000){id,name},agent.limit(1000){id,name},reply.limit(1000).order(chronological){id,message,created_at},reply:user.limit(1000){id,name,image,image_url},reply:files.limit(1000){id,filename,file_url,hashname}')}`).then((response) => {
                //     this.item = response.data.data;
                // });
            },
            getProjects() {
                return this.$http.get(`/project/me?limit=1000`).then((response) => {
                    this.projects = response.data.data;
                });
            },
            getTasks() {
                return this.$http.get(`/task/me?limit=1000`).then((response) => {
                    this.tasks = response.data.data;
                });
            },
            getMyTimer() {
                return this.$http.get(`/timelog/me?fields=${encodeURIComponent('id,start_time,memo,task_id,timer,timer_start_time')}`).then((response) => {
                    this.timelogData = response.data.data;
                });
            },
            onProjectChange (event) {
                const id = event.target.value * 1;
                this.item.project = _.find(this.projects, (item) => item.id === id);
            },
            onTaskChange (event) {
                const id = event.target.value * 1;
                this.item.task = _.find(this.tasks, (item) => item.id === id);
            },
        },
    }
</script>
