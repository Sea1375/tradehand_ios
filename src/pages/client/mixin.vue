<script type="text/babel">

import Cache from '../../assets/vue/scripts/cache';

    export default {
        computed: {
            selfUrl () {
                let self_url = '/client/';
                if (this.isEmployeeRoute) {
                    self_url = '/self' + self_url;
                }
                return self_url;
            }
        },
        methods: {
            /** Data getters **/
            getItem () {
                return this.$http.get(`/client/${ this.$f7route.params.id }?fields=${encodeURIComponent('id,name,email,login,image,image_url,status,clientDetail.limit(1000){id,name,email,company_name,address,website,note,skype},clientDetail:category{id,category_name},clientDetail:subCategory{id,category_id,category_name}')}`).then((response) => {
                    this.item = response.data.data;
                });
            },

            /** Formatters **/
            formatStatus (item) {
                return this.capitalize(item.status);
            },

            getCategories () {
                return Cache.httpGet('/client-category?fields=id,category_name&limit=1000').then((response) => {
                    this.categories = response.data;
                });
            },

            getSubCategories () {
                return Cache.httpGet('/client-sub-category?fields=id,category_name,category_id&limit=1000').then((response) => {
                    this.allSubCategories = response.data;
                });
            },

            onStatusChange (event) {
                this.item.status = event.target.value;
            },
            onCategoryChange (event) {
                const id = event.target.value * 1;
                this.item.client_detail.category = _.find(this.categories, (item) => item.id === id);

                this.subCategories = _.filter(this.allSubCategories, (item) => item.category_id === id);
            },
            onSubCategoryChange (event) {
                const id = event.target.value * 1;
                this.item.client_detail.sub_category = _.find(this.subCategories, (item) => item.id === id);
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
