<style type="text/css" scoped>
    #selected{background-color: rgba(0, 0, 0, 0.15);}
</style>
<template>

    <f7-page id="my-projects-list" infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh"
             :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad"
    >
        <f7-navbar :sliding="false" >
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title>{{ trans('app.project') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#"  sheet-open=".my-project-filter" icon-f7="slider_horizontal_3"></f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-searchbar
            class="item-search"
            :disable-button-text="trans('app.cancel')"
            :placeholder="trans('app.search')"
            :clear-button="true"
            :custom-search="true"
            @searchbar:search="onSearch"
            @searchbar:clear="onSearchClear"
        ></f7-searchbar>
        <f7-block class="search-list">
            <f7-card v-for="item in items" v-bind:key="item.id" @click.native="show(item)">
                <f7-card-content>
                    <f7-row>
                        <f7-col width="60">
                            <span class="project-name">{{item.project_name}}</span>
                        </f7-col>
                        <f7-col width="40" class="text-align-right">
                            <f7-badge :color="formatStatusColor(item)">{{formatStatus(item)}}</f7-badge>
                        </f7-col>
                    </f7-row>
                    <f7-row class="margin-top">
                        <f7-col>
                            <f7-progressbar :color="formatProgressColor(item)"
                                            :progress="item.completion_percent"></f7-progressbar>
                        </f7-col>
                    </f7-row>
                    <f7-row class="margin-top">

                        <f7-col width="60">
                            <img :src="member.image_url" width="25" height="25"
                                 class="lazy lazy-fade-in margin-right-half" v-for="member in item.members"/>
                        </f7-col>
                        <f7-col width="40" class="text-align-right text-color-gray task">
                            <f7-col class="deadline text-align-right text-color-gray" v-if="item.deadline">
                                <f7-icon f7="calendar"></f7-icon>
                                {{formatDate(item)}}
                            </f7-col>
                        </f7-col>
                    </f7-row>
                </f7-card-content>

            </f7-card>
        </f7-block>


        <f7-sheet
            class="my-project-filter"
            style="height:auto; --f7-sheet-bg-color: #fff;"
            swipe-to-close
            backdrop>
            <f7-toolbar bg-color="blue">
                <div class="left padding-left">{{ trans('app.filterResults') }}</div>
                <div class="right">
                    <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                </div>
            </f7-toolbar>

            <!-- Scrollable sheet content -->
            <f7-list>
                <f7-list-item view=".view-main" sheet-close :title="capitalize(state)"
                      :id="(state === selectedFilter)? `selected` : ``"
                      :key="index"
                      @click="changeStatus(state)" v-for="(state,index) in status">

                    <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
                </f7-list-item>
            </f7-list>
        </f7-sheet>

        <f7-fab v-if="!isEmployeeRoute" position="right-bottom" slot="fixed" href="/project/create" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>
    </f7-page>
</template>

<script type="text/babel">
import IndexMixin from '../../assets/vue/mixins/index';
import CommonMixin from '../../assets/vue/mixins/common';
import FilterMixin from './filter-mixin';

export default {
    mixins: [IndexMixin, CommonMixin, FilterMixin],
    data() {
        return {
            endpoint: '',
            fields: 'id,project_name,status,deadline,completion_percent,client.limit(1000){id,name},members.limit(1000){id,name,image,image_url}',
            order: "id desc",
            currentItem: [],
            status: ['all', 'finished', 'in progress', 'not started', 'canceled', 'on hold'],
            selectedFilter: 'all',
        };
    },
    mounted(){
        this.endpoint = 'project/me';
    },
    created() {
        this.pageId = Math.round(Math.random() * 100);
    },

    methods: {
        getFilters() {
            let filters = '';
            if (this.search_query !== null) {
                filters += `(project_name lk "%${this.search_query}%" ) and `;
            }
            if (this.selectedFilter !== 'all') {
                filters += `status eq "${ this.selectedFilter }" and `;
            }
            // Remove trailing 'and' and encode for URI
            filters = encodeURIComponent(filters.substring(0, filters.length - 4));
            return filters;
        },
        formatData(item) {
            return `${this.capitalize(item.project_name)} <span class="color-gray">(${this.capitalize(item.project_name)})</span>`;
        },
        show(item) {
            this.$f7router.navigate((this.selfUrl + item.id), {
                query: {
                    item: item
                },
            });
        },
    },
};
</script>
