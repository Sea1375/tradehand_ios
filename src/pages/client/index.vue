<template>
    <f7-page infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh" :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad">
        <!-- Top Navbar -->
        <f7-navbar :sliding="false" >
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title sliding>{{trans('app.menu.clients')}}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" sheet-open=".client-filter" icon-f7="slider_horizontal_3"></f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-searchbar
            :disable-button-text="trans('app.cancel')"
            :placeholder="trans('app.search')"
            :clear-button="true"
            :custom-search="true"
            @searchbar:search="onSearch"
            @searchbar:clear="onSearchClear"
        ></f7-searchbar>
        <f7-block v-if="!busy && items.length === 0" style="text-align: center;">
            {{ trans('messages.noClientFound') }}
        </f7-block>

        <f7-list media-list inset id="client-list" class="search-list searchbar-found">
            <f7-list-item
                swipeout
                badge=" "
                v-for="item in items"
                v-bind:key="item.id"
                link="#"
                :title="item.name"
                :footer="item.client_detail ? item.client_detail.company_name :``"
                :badge-color="formatStatusColor(item)"
                @click="show(item)">
                <img
                    slot="media"
                    :src="item.image_url"
                    width="44"
                    height="44"
                    class="lazy lazy-fade-in"
                />
            </f7-list-item>

        </f7-list>
        <f7-sheet
            class="client-filter"
            style="height:auto; --f7-sheet-bg-color: #fff;"
            backdrop>
            <f7-toolbar bg-color="blue">
                <div class="left padding-left">{{ trans('app.filterResults') }}</div>
                <div class="right">
                    <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                </div>
            </f7-toolbar>
            <f7-list>
                <f7-list-input
                    :label="trans('app.status')"
                    type="select"
                    @change="onStatusChange"
                >
                    <option :value="status" v-for="status in allStatus" :key="status">{{ trans('app.'+status) }}</option>
                </f7-list-input>
                <f7-list-input
                    :label="trans('modules.client.clientCategory')"
                    type="select"
                    @change="onCategoryChange"
                    :placeholder="trans('messages.pleaseSelectCategory')"
                    >
                    <option value="0">{{ trans('app.all') }}</option>
                    <option value="" v-if="categories.length===0">{{ trans('messages.pleaseSelectCategory') }}</option>
                    <option v-else :value="category.id" v-for="category in categories" :key="category.id">{{ category.category_name }}</option>
                </f7-list-input>
                <f7-list-input
                    :label="trans('modules.client.clientSubCategory')"
                    type="select"
                    @change="onSubCategoryChange"
                    :placeholder="trans('messages.noCategoryAdded')"
                >
                    <option value="0">{{ trans('app.all') }}</option>
                    <option value="" v-if="subCategories.length===0">{{ trans('messages.noCategoryAdded') }}</option>
                    <option v-else :value="sub_category.id" v-for="sub_category in subCategories" :key="sub_category.id">{{ sub_category.category_name }}</option>
                </f7-list-input>
                <br>
                <br>
                <f7-block>
                    <f7-button fill color="green" class="login-btn" large raised round @click="apply" >{{ trans('app.apply') }}</f7-button>
                </f7-block>
            </f7-list>
            <!-- Scrollable sheet content -->

        </f7-sheet>
        <!-- Extended FAB Center Bottom (Red) -->
        <f7-fab position="right-bottom" slot="fixed" href="/client/create" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>
    </f7-page>
</template>

<script type="text/babel">
    import IndexMixin from '../../assets/vue/mixins/index';
    import CommonMixin from '../../assets/vue/mixins/common';
    import ModuleMixin from './mixin';
    import Cache from "../../assets/vue/scripts/cache";

    export default {
        mixins: [IndexMixin, CommonMixin, ModuleMixin],
        data () {
            return {
                endpoint: 'client',
                fields: 'id,name,email,image,image_url,status,clientDetail.limit(1000){id,company_name,category_id,sub_category_id}',
                order: "users.id desc",
                allStatus: ['all', 'active', 'inactive'],
                categories: [],
                subCategories: [],
                allSubCategories: [],
                item: {
                    status: 'all',
                    client_detail: {
                        company_name: null,
                        category: {
                            id: null
                        },
                        sub_category: {
                            id: null
                        }
                    }
                }
            };
        },
        created () {
            this.pageId = Math.round(Math.random() * 100);
        },
        mounted () {

        },
        methods: {
            pageLoad (page) {
                if(this.applicationName() === 'worksuite-saas') {
                    this.fields = 'id,name,image,image_url,status,clientDetail.limit(1000){id,name,email,company_name,category_id,sub_category_id}';
                }
                else{
                    this.fields = 'id,name,email,image,image_url,status,clientDetail.limit(1000){id,company_name,category_id,sub_category_id}';
                }
                this.$f7.preloader.show();

                const promises = [];
                promises.push(this.getCategories());
                promises.push(this.getSubCategories());

                Promise.all(promises).then(() => {
                    // this.item.client_detail.category =  this.categories[0];
                    this.subCategories = _.filter(this.allSubCategories, (item) => item.category_id === this.categories[0].id);
                    // this.item.client_detail.sub_category =  this.subCategories[0];

                    this.init();
                    this.$f7.preloader.hide();
                }, () => {
                    this.$f7.preloader.hide();
                });
            },
            getFilters () {
                let filters = '';

                if (this.search_query !== null) {
                    filters = `(users.name lk "%${this.search_query}%" ) and `;
                }

                if (this.item.status !== 'all' && this.item.status !== null) {
                    filters += `status eq "${ this.item.status }" and `;
                }

                if (this.item.client_detail.category.id !== 0 && this.item.client_detail.category.id !== null) {
                    filters += `client_details.category_id eq "${ this.item.client_detail.category.id }" and `;
                }

                if (this.item.client_detail.sub_category.id !== 0 && this.item.client_detail.sub_category.id !== null) {
                    filters += `client_details.sub_category_id eq "${ this.item.client_detail.sub_category.id }" and `;
                }
                // Remove trailing 'and' and encode for URI
                filters = encodeURIComponent(filters.substring(0, filters.length - 4));

                return filters;
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
                if (id===0){
                    this.item.client_detail.category.id = null;
                    this.item.client_detail.sub_category.id = null;
                }
                else{
                    this.item.client_detail.category = _.find(this.categories, (item) => item.id === id);
                    this.subCategories = _.filter(this.allSubCategories, (item) => item.category_id === id);
                }
            },
            onSubCategoryChange (event) {
                const id = event.target.value * 1;
                if (id===0){
                    this.item.client_detail.sub_category.id = null;
                }
                else{
                    this.item.client_detail.sub_category = _.find(this.subCategories, (item) => item.id === id);
                }

            },

            apply() {
                this.$f7.sheet.get('.client-filter').close();
                this.init();
            },

            formatData (item) {
                return `${this.capitalize(item.name)} <span class="color-gray">(${this.capitalize(item.name)})</span>`;
            },

            show (item) {
                this.$f7router.navigate(('/client/' + item.id),{
                    query: {
                        item: item
                    },
                });
            },
        },
    };
</script>
