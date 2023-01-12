<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';
    import moment from 'moment';

    export default {
       computed: {
          selfUrl () {
             let self_url = '/estimate/';
             // if (this.isEmployeeRoute) {
             //    self_url = '/self' + self_url;
             // }
             return self_url;
          }
       },
        methods: {
            /** Data getters **/
            getItem() {
                return this.$http.get(`/estimate/${this.$f7route.params.id}?fields=${encodeURIComponent('id,estimate_number,valid_till,created_at,total,sub_total,status,note,discount,discount_type,client.limit(1000){id,name},client:client_details.limit(1000){id,address},currency.limit(1000){id,currency_code,currency_symbol},items.limit(1000){id,item_name,type,quantity,unit_price,amount,taxes}')}`).then((response) => {
                    this.item = response.data.data;
                });
            },
            getClients() {
                return this.$http.get(`/client?limit=1000`).then((response) => {
                    this.clients = response.data.data;
                });
            },
           getCurrencies() {
                return this.$http.get(`/currency?fields=id,currency_code,currency_symbol&limit=1000`).then((response) => {
                    this.currencies = response.data.data;
                });
            },
           getTaxes() {
                return Cache.httpGet(`/tax?fields=id,tax_name,rate_percent&limit=1000`).then((response) => {
                    this.allTaxes = response.data;
                });
            },

            /** Formatters **/
            formatStatus(item) {
                return this.capitalize(item);
            },
            onStartDateChange(date) {
                if (date) {
                    this.item.valid_till = moment(date).format('YYYY-MM-DD');
                }
            },
            onStatusChange (event) {
                this.item.status = event.target.value;
            },
            onClientChange (event) {
                const id = event.target.value * 1;
                this.item.client = _.find(this.clients, (item) => item.id === id);
            },
           onCurrencyChange (event) {
                const id = event.target.value * 1;
                this.item.currency = _.find(this.currencies, (item) => item.id === id);
            },
            formatStatusColor(item) {
                if (item.status === 'accepted') {
                    return 'green';
                } else if (item.status === 'sent') {
                    return 'green';
                }else if (item.status === 'declined') {
                    return 'red';
                } else if (item.status === 'draft') {
                    return '#ffcc00';
                }else if (item.status === 'waiting') {
                    return '#ffcc00';
                }
            },
            formatSheetStatusColor(status) {
               if (status === 'accepted') {
                  return 'green';
               } else if (status === 'sent') {
                  return 'green';
               }else if (status === 'declined') {
                  return 'red';
               } else if (status === 'draft') {
                  return '#ffcc00';
               }else if (status === 'waiting') {
                  return '#ffcc00';
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
