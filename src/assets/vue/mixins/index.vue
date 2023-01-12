<script type="text/babel">
    import Cache from '../scripts/cache';
    import _ from 'lodash';

    export default {
        data () {
            return {
                items: [],
                currentPage: 1,
                loadMorePages: true,
                perPage: 15,
                infiniteScrollInProgress: false,
                infiniteScrollPreloader: false,

                search_query: null,
                selectedFilter: 'all',
                busy: true,
            };
        },
        mounted () {
            //
        },
        methods: {
            pageLoad (page) {
                this.init();
            },
            init () {
                this.items = [];
                this.loadMorePages = true;
                this.currentPage = 1;

                this.$f7.preloader.show();

                this.getData().then(() => {
                    this.$f7.preloader.hide();
                }, () => {
                    this.$f7.preloader.hide();
                });
            },
            refresh () {
                // Clear cache for pull to refresh
                Cache.removeMatching(this.endpoint);

                this.items = [];
                this.loadMorePages = false; // False so that infinite scroll preloader is hidden
                this.currentPage = 1;

                this.getData().then(() => {
                    this.loadMorePages = true;
                    this.$f7.ptr.done();
                    this.removePtrClass();

                }, () => {
                    this.loadMorePages = true;
                    this.$f7.ptr.done();
                    this.removePtrClass();
                });

            },
            removePtrClass (){
                let active = document.querySelectorAll(".ptr-content");
                for (let i = 0; i < active.length; i++) {
                    active[i].classList.remove("ptr-refreshing");
                    active[i].classList.remove("ptr-pull-up");
                    active[i].classList.remove("ptr-transitioning");
                }
            },
            onInfiniteScroll () {
                if (this.loadMorePages && !this.infiniteScrollInProgress) {
                    this.infiniteScrollInProgress = true;

                    const nextPage = this.currentPage + 1;

                    this.getData(nextPage).then(() => {
                        this.infiniteScrollInProgress = false;
                        this.currentPage = nextPage;
                    }, () => {
                        this.infiniteScrollInProgress = false;
                        this.$f7.preloader.hide();
                    });
                }
            },
            onSearch: _.debounce(function (searchBar,query, found) {
                console.log('Some search is going on',query);
                //this.removeOverlay();
                this.search_query = query;
                this.init();
            }, 300),
            onSearchClear (event) {
                //this.removeOverlay();
                this.search_query = null;
                this.init();
            },
            removeOverlay () {
                const overlays = document.querySelectorAll('.searchbar-enabled');

                overlays.forEach((overlay) => {
                    overlay.classList.remove('searchbar-enabled');
                });
            },
            changeStatus(status) {
                this.selectedFilter = status;
                this.init()
            },
            getData (page) {
                this.busy = true;

                let query = '';

                if (this.fields !== null && this.fields !== undefined) {
                    query += `&fields=${ encodeURIComponent(this.fields) }`;
                }

                if (this.order !== null && this.order !== undefined) {
                    query += `&order=${ encodeURIComponent(this.order) }`;
                }

                const limit = this.perPage;
                query += `&limit=${ limit }`;

                if (page !== undefined && page !== 1) {
                    query += `&offset=${ (page - 1) * limit }`;
                }

                if (this.getFilters().length > 0) {
                    query += `&filters=${ this.getFilters() }`;
                }

                return Cache.httpGet(`/${ this.endpoint }?${ query }`).then((response) => {
                    if (response.data.length === 0) {
                        // We have reached end of list, so don't load more data
                        this.loadMorePages = false;
                    }
                    else {
                        this.items = this.items.concat(response.data);
                    }
                    this.busy = false;
                }, () => {
                    this.busy = false;
                });
            },
        },
        watch: {
            '$store.state.cacheInvalidated': function (newValue) {
                console.log(newValue + ' ' + this.endpoint);
                if (newValue.startsWith(this.endpoint)) {
                    console.log('refreshing');
                    this.init();
                }
            },
        },
    }
</script>
