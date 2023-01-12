<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';
    import moment from 'moment';

    export default {
        computed: {

        },
        methods: {
            /** Data getters **/
            getItem () {

                return this.$http.get(`/notice/${ this.$f7route.params.id }?fields=${encodeURIComponent('id,heading,description,to,created_at}')}`).then((response) => {
                    this.item = response.data.data;
                });
            },
            /** Formatters **/
            formatCreatedDate (item) {
                return moment(item.created_at).format(this.getCompanyMomentDateFormat);
            },

            formatDescription (item) {
                if (item.description) {
                    return item.description.replace(/<(?:.|\n)*?>/gm, '').substring(0, 100);
                }
                else {
                    return '-';
                }
            },
        },
    }
</script>
