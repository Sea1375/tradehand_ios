<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';
    import moment from 'moment';

      export default {
         computed: {
            selfUrl () {
               let self_url = '/message/';
               if (this.isEmployeeRoute) {
                  self_url = '/self' + self_url;
               }
               return self_url;
            }
         },
         methods: {
            /** Data getters **/
            getItem() {
               return this.$http.get(`/userchat/messages/${this.$f7route.params.id}?limit=1000&fields=${encodeURIComponent('id,from,to,message_seen,message,created_at,message_time,message_seen_status,fromUser.limit(1000){id,name,image,image_url},toUser.limit(1000){id,name,image,image_url}')}`).then((response) => {
                  this.item = response.data.data;
               });
            },

             getEmployees() {
                 return this.$http.get(`/employee?limit=1000&filters=status eq "active"`).then((response) => {
                     this.employees = response.data.data;
                 });
             },

             getMessageSetting() {
                 return this.$http.get(`/userchat/message-setting`).then((response) => {
                     this.messageSetting = response.data.data;
                 });
             },

             getClients() {
                 return this.$http.get(`/client?limit=1000&filters=status eq "active"`).then((response) => {
                     this.clients = response.data.data;
                 });
             },

             onEmployeeChange (event) {
                 const id = event.target.value * 1;
                 this.employee = _.find(this.employees, (item) => item.id === id);
             },

             onClientChange (event) {
                 const id = event.target.value * 1;
                 this.client = _.find(this.clients, (item) => item.id === id);
             },

             onMessageSendToTypeChange (event) {
                 this.messageSendToType = event.target.value;
             },

            /** Formatters **/
            formatStatus(item) {
               return this.capitalize(item);
            },

            formatStatusColor(item) {
               if (item.message_seen === 'no') {
                  return 'green';
               }
            },
         },
      }
</script>
