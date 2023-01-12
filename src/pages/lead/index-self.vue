<template>
    <f7-page infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh" :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad">
    <!-- Top Navbar -->
        <f7-navbar :sliding="false">
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title sliding>{{ trans('app.menu.leads') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" sheet-open=".my-lead-filter" icon-f7="slider_horizontal_3"></f7-link>
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
            {{ trans('messages.noLeadFound') }}
        </f7-block>

        <f7-list inset>
            <f7-list-item
                v-for="item in items"
                v-bind:key="item.id"
                link="#"
                :title="item.client_name"
                :subtitle="item.company_name"
                @click="show(item)"
            ></f7-list-item>
        </f7-list>

        <f7-sheet
            class="my-lead-filter"
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
                    :label="trans('app.next_follow_up')"
                    type="select"
                    @change="onNextFollowUpChange"
                    >
                    <option :value="next_follow_up" v-for="next_follow_up in next_follow_ups" :key="next_follow_up">{{ trans('app.'+next_follow_up) }}</option>
                </f7-list-input>
                <f7-list-input
                    :label="trans('modules.lead.leadCategory')"
                    type="select"
                    @change="onCategoryChange"
                    :placeholder="trans('messages.pleaseSelectCategory')"
                    >
                    <option value="0">{{ trans('app.all') }}</option>
                    <option value="" v-if="categories.length===0">{{ trans('messages.pleaseSelectCategory') }}</option>
                    <option v-else :value="category.id" v-for="category in categories" :key="category.id">{{ category.category_name }}</option>
                </f7-list-input>
                <f7-list-input
                    :label="trans('modules.lead.leadStatus')"
                    type="select"
                    @change="onLeadStatusChange"
                    >
                    <option value="0">{{ trans('app.all') }}</option>
                    <option value="" v-if="allLeadStatus.length===0">{{ trans('modules.lead.leadStatus') }}</option>
                    <option v-else :value="leadStatus.id" v-for="leadStatus in allLeadStatus" :key="leadStatus.id">{{ leadStatus.type }}</option>
                </f7-list-input>
                <f7-list-input
                    :label="trans('modules.lead.leadSource')"
                    type="select"
                    @change="onLeadSourceChange"
                    >
                    <option value="0">{{ trans('app.all') }}</option>
                    <option value="" v-if="leadSources.length===0">{{ trans('modules.lead.leadSource') }}</option>
                    <option v-else :value="leadSource.id" v-for="leadSource in leadSources" :key="leadSource.id">{{ leadSource.type }}</option>
                </f7-list-input>

                <br>
                <br>
                <f7-block>
                    <f7-button fill color="green" class="login-btn" large raised round @click="apply" >{{ trans('app.apply') }}</f7-button>
                </f7-block>
            </f7-list>
            <!-- Scrollable sheet content -->
        </f7-sheet>
        
    </f7-page>
</template>

<script type="text/babel">
    import IndexMixin from '../../assets/vue/mixins/index';
    import CommonMixin from '../../assets/vue/mixins/common';
    import ModuleMixin from './filter-mixin';

    export default {
        mixins: [IndexMixin, CommonMixin, ModuleMixin],
        
        data () {
            return {
                endpoint: '',
                fields: 'id,client_name,company_name,next_follow_up',
                order: "id desc",
                next_follow_ups: ['all', 'yes', 'no'],
                categories: [],
                leadSources: [],
                allLeadStatus: [],
                item: {
                    next_follow_up: 'all',
                    category: {
                      id: null
                    },
                    lead_source: {
                      id: null
                    },
                    lead_status: {
                      id: null
                    }
                }
            };
        },
        
        created () {
            this.pageId = Math.round(Math.random() * 100);
        },
        
        mounted () {
            this.endpoint = 'lead/me';
        },
        
        methods: {
            pageLoad (page) {
                this.$f7.preloader.show();
    
                const promises = [];
                promises.push(this.getCategories());
                promises.push(this.getLeadSource());
                promises.push(this.getLeadStatus());
    
                Promise.all(promises).then(() => {
                    
                    this.init();
                    this.$f7.preloader.hide();
                }, () => {
                    this.$f7.preloader.hide();
                });
            },
            
            getFilters () {
                let filters = '';
        
                if (this.search_query !== null) {
                    filters = `(client_name lk "${ this.search_query }%" or client_name lk "${ this.search_query }%" or  status lk "${ this.search_query }%" ) and `;
                }
        
                if (this.item.next_follow_up !== 'all' && this.next_follow_up !== null) {
                    filters += `next_follow_up eq "${ this.item.next_follow_up }" and `;
                }
        
                if (this.item.category.id !== 0 && this.item.category.id !== null) {
                    filters += `category_id eq "${ this.item.category.id }" and `;
                }
        
                if (this.item.lead_source.id !== 0 && this.item.lead_source.id !== null) {
                    filters += `source_id eq "${ this.item.lead_source.id }" and `;
                }
        
                if (this.item.lead_status.id !== 0 && this.item.lead_status.id !== null) {
                    filters += `status_id eq "${ this.item.lead_status.id }" and `;
                }
                // Remove trailing 'and' and encode for URI
                filters = encodeURIComponent(filters.substring(0, filters.length - 4));
        
                return filters;
            },
        
            onCategoryChange (event) {
                const id = event.target.value * 1;
                if (id===0){
                    this.item.category.id = null;
                }
                else{
                    this.item.category = _.find(this.categories, (item) => item.id === id);
                }
            },
            
            onLeadSourceChange (event) {
                const id = event.target.value * 1;
                if (id===0){
                    this.item.lead_source.id = null;
                }
                else{
                    this.item.lead_source = _.find(this.leadSources, (item) => item.id === id);
                }
            },
        
            onLeadStatusChange (event) {
                const id = event.target.value * 1;
                if (id===0){
                    this.item.lead_status.id = null;
                }
                else{
                    this.item.lead_status = _.find(this.allLeadStatus, (item) => item.id === id);
                }
            },
        
            apply() {
                this.$f7.sheet.get('.my-lead-filter').close();
                this.init();
            },
        
            formatData (item) {
                return `${this.capitalize(item.name)} <span class="color-gray">(${this.capitalize(item.name)})</span>`;
            },
        
            show (item) {
                this.$f7router.navigate(('/lead/' + item.id),{
                    query: {
                        item: item
                    },
                });
            },
        },
    };
</script>
