<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';
    import moment from 'moment';

    export default {
        computed: {
            selfUrl () {
                let self_url = '/lead/';
                if (this.isEmployeeRoute) {
                    self_url = '/self' + self_url;
                }
                return self_url;
            }
        },
        methods: {
            /** Data getters **/
            getItem () {
                return this.$http.get(`/lead/${ this.$f7route.params.id }?fields=${encodeURIComponent('id,client_name,client_email,company_name,website,mobile,lead_source.limit(1000){id,type},category.limit(1000){id,category_name},lead_status.limit(1000){id,type,label_color},lead_agent.limit(1000){id,user_id},lead_agent:user.limit(1000){id,name}')}`).then((response) => {
                    this.item = response.data.data;
                });
            },

            getCategories () {
                return Cache.httpGet('/lead-category?fields=id,category_name&limit=1000').then((response) => {
                    this.categories = response.data;
                });
            },

            getLeadSource() {
                return this.$http.get(`/lead-source?limit=1000`).then((response) => {
                    this.leadSources = response.data.data;
                });
            },

            getLeadAgent() {
                return this.$http.get(`/lead-agent?fields=${encodeURIComponent('user.limit(1000){id,name}')}&limit=1000`).then((response) => {
                    this.leadAgents = response.data.data;
                });
            },

            getLeadStatus() {
                return this.$http.get(`/lead-status?fields=${encodeURIComponent('type')}&limit=1000`).then((response) => {
                    this.allLeadStatus = response.data.data;
                });
            },

            onNextFollowUpChange (event) {
                this.item.next_follow_up = event.target.value;
            },

            onLeadSourceChange (event) {
                const id = event.target.value * 1;
                this.item.lead_source = _.find(this.leadSources, (item) => item.id === id);
            },

            onLeadAgentChange (event) {
                const id = event.target.value * 1;
                this.item.lead_agent = _.find(this.leadAgents, (item) => item.id === id);
            },

            onLeadStatusChange (event) {
                const id = event.target.value * 1;
                this.item.lead_status = _.find(this.allLeadStatus, (item) => item.id === id);
            },

            onCategoryChange (event) {
                const id = event.target.value * 1;
                this.item.category = _.find(this.categories, (item) => item.id === id);
            },

            /** Formatters **/

        },
    }
</script>
