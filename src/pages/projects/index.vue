<style type="text/css" scoped>
    #selected{background-color: rgba(0, 0, 0, 0.15);}
</style>
<template>

    <f7-page id="projects-list" infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh"
             :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad"
    >

        <f7-navbar :sliding="false" >
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title>{{ trans('app.project') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#"  sheet-open=".project-filter" icon-f7="slider_horizontal_3"></f7-link>
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
                                            :progress="parseInt(item.completion_percent)"></f7-progressbar>
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
                class="project-filter"
                style="height:auto; --f7-sheet-bg-color: #fff;"
                swipe-to-close
                @sheetOpen="onSheetOpen"
                backdrop>
            <f7-toolbar bg-color="blue">
                <div class="left padding-left">{{ trans('app.filterResults') }}</div>
                <div class="right">
                    <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                </div>
            </f7-toolbar>

            <!-- Scrollable sheet content -->
            <f7-list>
                <f7-list-input
                    :label="trans('app.status')"
                    type="select"
                    @change="onChangeStatus"
                    :placeholder="trans('app.select')"
                >
                    <option :value="state" :selected="state===selectedFilter" v-for="(state,index) in status" :key="index">{{ capitalizeStatus(state) }}</option>
                </f7-list-input>
                <f7-list-item :title="trans('app.client')" smart-select id="clientSmartSelect"
                      @change="onClientChange"
                      :smart-select-params="{
                          on: {open: onSSOpen, close: onSSClose},
                          openIn: 'popup',
                          searchbar: true,
                          searchbarPlaceholder: trans('app.search')}"
                >
                    <select name="client" @change="onClientChange">
                        <option :value="client.id" :selected="client.id === item.client.id" v-for="client in clients" :key="client.id">{{client.name}}</option>
                    </select>
                </f7-list-item>
                <f7-list-item :title="trans('modules.projects.projectMembers')" smart-select id="projectMemberSmartSelect"
                      @change="onProjectMemberChange"
                      :smart-select-params="{
                          on: {open: onSSOpen, close: onSSClose},
                          openIn: 'popup',
                          searchbar: true,
                          searchbarPlaceholder: trans('app.search')}"
                >
                    <select name="employee" @change="onProjectMemberChange">
                        <option :value="member.id" :selected="member.id === item.member.id" v-for="member in employees" :key="member.id">{{member.name}}</option>
                    </select>
                </f7-list-item>
                <f7-list-input
                    :label="trans('modules.projects.projectCategory')"
                    type="select"
                    @change="onCategoryChange"
                    :placeholder="trans('app.select')"
                >
                    <option :value="category.id" :selected="category.id === item.category.id" v-for="category in categories" :key="category.id">{{ category.category_name }}</option>
                </f7-list-input>
                <br>
                <br>
                <f7-block>
                    <f7-row>
                        <f7-col width="50">
                            <f7-button fill color="gray" class="login-btn" large raised round @click="onSheetReset" >{{ trans('app.reset') }}
                            </f7-button>
                        </f7-col>
                        <f7-col width="50">
                            <f7-button fill color="green" class="login-btn" large raised round @click="apply" >{{ trans('app.apply') }}
                            </f7-button>
                        </f7-col>
                    </f7-row>
                </f7-block>
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
                clients:[],
                categories: [],
                employees: [],
                status: ['all', 'finished', 'in progress', 'not started', 'canceled', 'on hold'],
                selectedFilter: 'all',
                item: {
                    category: {
                        id: 0
                    },
                    client: {
                        id: 0
                    },
                    member: {
                        id: 0
                    },
                },
            };
        },
        mounted(){
            this.endpoint = 'project';
        },
        created() {
            this.pageId = Math.round(Math.random() * 100);
        },

        methods: {
            pageLoad (page) {
                this.$f7.preloader.show();

                const promises = [];
                promises.push(this.getCategories(true));
                promises.push(this.getClients(true));
                promises.push(this.getEmployees());

                Promise.all(promises).then(() => {
                    this.employees = [{id: 0, name: this.trans('app.all')}, ...this.employees];
                    this.init();
                    this.$f7.preloader.hide();
                }, () => {
                    this.$f7.preloader.hide();
                });
            },
            getFilters() {
               let filters = '';
                if (this.search_query !== null) {
                    filters += `(project_name lk "%${this.search_query}%" ) and `;
                }
                if (this.selectedFilter !== 'all') {
                    filters += `status eq "${ this.selectedFilter }" and `;
                }
                if (this.item.client.id !== 0 && this.item.client.id !== null) {
                    filters += `client_id eq "${ this.item.client.id }" and `;
                }
                if (this.item.category.id !== 0 && this.item.category.id !== null) {
                    filters += `category_id eq "${ this.item.category.id }" and `;
                }
                if (this.item.member.id !== 0 && this.item.member.id !== null) {
                    filters += `project_member_id eq "${ this.item.member.id }" and `;
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
            onSSOpen() {
                this.$f7.sheet.get('.project-filter').close();
            },
            onSSClose() {
                this.$f7.sheet.get('.project-filter').open();
            },
            onSheetOpen() {
                let clientSmartSelect = this.$f7.smartSelect.get('#clientSmartSelect .smart-select');
                clientSmartSelect.setValue(this.item.client.id);
                let projectMemberSmartSelect = this.$f7.smartSelect.get('#projectMemberSmartSelect .smart-select');
                projectMemberSmartSelect.setValue(this.item.member.id);
            },
            onSheetReset() {
                let clientSmartSelect = this.$f7.smartSelect.get('#clientSmartSelect .smart-select');
                clientSmartSelect.setValue(0);
                let projectMemberSmartSelect = this.$f7.smartSelect.get('#projectMemberSmartSelect .smart-select');
                projectMemberSmartSelect.setValue(0);
            },
            apply() {
                this.$f7.sheet.get('.project-filter').close();
                this.init();
            },
            capitalizeStatus(status) {
                return this.capitalize(status);
            },
        },
    };
</script>
