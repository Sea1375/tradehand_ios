<style type="text/css" scoped>
    #selected{
    background-color: rgba(0, 0, 0, 0.15);
    }
</style>
<template>
    <f7-page infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh"
           :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad" id="task-list">
    <!-- Top Navbar -->

        <f7-navbar :sliding="false" back-link="Back" v-if="$f7route.params.id">
            <f7-nav-title v-if="items">{{ trans('app.project') }} {{ trans('app.menu.tasks') }}</f7-nav-title>
        </f7-navbar>

        <f7-navbar :sliding="false" v-else>
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title >{{ trans('app.menu.tasks') }}</f7-nav-title>
            <f7-nav-right>
            <f7-link href="#" sheet-open=".task-filter" icon-f7="slider_horizontal_3"></f7-link>
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
        <f7-block v-if="!busy && taskLoaded && items.length === 0" style="text-align: center;">
            {{ trans('messages.noTaskFound') }}
        </f7-block>

        <f7-block class="search-list">
            <f7-card  v-for="item in items" v-bind:key="item.id" @click.native="show(item)">
                <f7-card-content>
                    <f7-row>
                        <f7-col width="80">
                            <span class="project-name">{{item.heading}}</span>
                        </f7-col>
                        <f7-col width="20" class="text-align-right">
                            <f7-link class="text-color-blue">#{{item.id}}</f7-link>
                        </f7-col>
                        </f7-row>
                        <f7-row class="margin-top-half">
                        <f7-col class="text-color-gray"  width="70">
                            <template v-if="item.project"><f7-icon f7="layers"></f7-icon>{{item.project.project_name}}</template>
                        </f7-col>
                        <f7-col class="text-align-right" width="30">
                            <badge :item="item"></badge>
                        </f7-col>
                    </f7-row>

                    <f7-row class="margin-top" >
                        <f7-col width="60" >
                            <img :src="user.image_url" width="25" height="25" class="lazy lazy-fade-in margin-right-half" v-for="user in item.users" v-if="item.users.length>0" v-bind:key="user.id"/>
                        </f7-col>
                        <f7-col :width="item.users.length>0?40:100" class="deadline text-align-right text-color-gray">
                            <f7-icon f7="calendar"></f7-icon>
                            {{ formatDueDate(item.due_date) }}
                        </f7-col>
                    </f7-row>
                </f7-card-content>
            </f7-card>
        </f7-block>
        <!-- FAB Right Bottom (Orange) -->
        <!-- Extended FAB Center Bottom (Red) -->
        <f7-fab position="right-bottom" slot="fixed" :href="selfUrl+'create/'" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>
        <f7-sheet
            class="task-filter"
            style="height:auto; --f7-sheet-bg-color: #fff;"
            swipe-to-close
            @sheetOpen="onSheetOpen"
            backdrop>
            <f7-toolbar bg-color="blue">
                <div class="left padding-left">{{ trans('app.filterResults') }}</div>
                <div class="right">
                    <f7-link sheet-close>{{ trans('app.close') }} </f7-link>
                </div>
            </f7-toolbar>

            <!-- Scrollable sheet content -->
            <f7-list>
                <f7-list-input
                    :label="trans('app.status')"
                    type="select"
                    @change="onColumnChange"
                    :placeholder="trans('app.selectStatus')"
                >
                    <option :value="column.id" :selected="column.id===item.board_column.id" v-for="column in columns" :key="column.id">{{ column.column_name }}</option>
                </f7-list-input>
                <f7-list-item :title="trans('app.project')" smart-select id="projectSmartSelect"
                              @change="onProjectChange"
                              :smart-select-params="{on: {open: onSSOpen, close: onSSClose}, openIn: 'popup', pageTitle: trans('modules.tasks.selectProject')}"
                >
                    <select name="project" @change="onProjectChange">
                        <option :value="project.id" :selected="project.id === item.project.id" v-for="project in projects" :key="project.id">{{project.project_name}}</option>
                    </select>
                </f7-list-item>
                <f7-list-item :title="trans('modules.tasks.assignTo')" smart-select id="assignedToSmartSelect"
                              @change="onTaskUserChange"
                              :smart-select-params="{on: {open: onSSOpen, close: onSSClose}, openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search')}"
                >
                    <select name="employee" @change="onTaskUserChange">
                        <option :value="employee.id" :selected="employee.id === item.employee.id" v-for="employee in employees" :key="employee.id">{{employee.name}}</option>
                    </select>
                </f7-list-item>
                <f7-list-item :title="trans('modules.tasks.assignBy')" smart-select id="assignedBySmartSelect"
                              @change="onAssignedByChange"
                              :smart-select-params="{on: {open: onSSOpen, close: onSSClose}, openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search')}"
                >
                    <select name="employee" @change="onAssignedByChange">
                        <option :value="assignedBy.id" :selected="assignedBy.id === item.assignedBy.id" v-for="assignedBy in employees" :key="assignedBy.id">{{assignedBy.name}}</option>
                    </select>
                </f7-list-item>
                <f7-list-item :title="trans('app.client')" smart-select id="clientSmartSelect"
                              @change="onClientChange"
                              :smart-select-params="{on: {open: onSSOpen, close: onSSClose}, openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search')}"
                >
                    <select name="client" @change="onClientChange">
                        <option :value="client.id" :selected="client.id === item.client.id" v-for="client in clients" :key="client.id">{{client.name}}</option>
                    </select>
                </f7-list-item>
                <f7-list-input
                    :label="trans('modules.tasks.taskCategory')"
                    type="select"
                    @change="onCategoryChange"
                    :placeholder="trans('modules.tasks.selectTaskCategory')"
                >
                    <option :value="category.id" :selected="category.id === item.category.id" v-for="category in categories" :key="category.id">{{ category.category_name }}</option>
                </f7-list-input>
                <f7-list-item
                    checkbox
                    :title="trans('modules.tasks.hideCompletedTask')"
                    name="completedTask"
                    :checked="hideCompletedTask"
                    @change="onHideCompletedTaskChange"
                ></f7-list-item>
                <br>
                <br>
                <f7-block>
                    <f7-row>
                        <f7-col width="50">
                            <f7-button fill color="gray" class="login-btn" large raised round @click="onSheetReset" >
                                {{ trans('app.reset') }}
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
    </f7-page>
</template>

<script type="text/babel">
    import IndexMixin from '../../assets/vue/mixins/index';
    import CommonMixin from '../../assets/vue/mixins/common';
    import FilterMixin from './filter-mixin';

    export default {
        mixins: [IndexMixin, CommonMixin, FilterMixin],
        data () {
            return {
                endpoint: 'task',
                fields: 'id,heading,due_date,status,project{id,project_name},users{id,name,image,image_url},board_column{id,column_name,slug,label_color},category{id,category_name}',
                order: "id desc",
                perPage:10,
                columns: [],
                categories: [],
                projects:[],
                clients:[],
                employees: [],
                hideCompletedTask: true,
                completedTaskBoardColumn: null,
                sheetOpened: false,
                taskLoaded: false,
                item: {
                    category: {
                        id: 0
                    },
                    project: {
                        id: 0
                    },
                    board_column:{
                        id: 0
                    },
                    client:{
                        id: 0
                    },
                    employee:{
                        id: 0
                    },
                    assignedBy:{
                        id: 0
                    }
                },
            };
        },
        mounted(){
            // this.pageLoad();
        },
        created () {
            this.pageId = Math.round(Math.random() * 100);
        },
        // events: {
        //     sheetOpen: function () {
        //         console.log('created!')
        //     },
        // },

        methods: {
            pageLoad (page) {
                this.$f7.preloader.show();

                const promises = [];
                promises.push(this.getCategories(true));
                promises.push(this.getProjects(true));
                promises.push(this.getBoardColumns(true));
                promises.push(this.getClients(true));
                promises.push(this.getEmployees());

                Promise.all(promises).then(() => {
                    this.employees = [{id: 0, name: 'All'}, ...this.employees];
                    this.completedTaskBoardColumn = this.setCompletedColumn;
                    this.init();
                    this.$f7.preloader.hide();
                    this.taskLoaded = true;
                }, () => {
                    this.$f7.preloader.hide();
                    this.taskLoaded = true;
                });
            },
            getFilters () {
                let filters = '';
                if(this.$f7route.params.id){
                  filters += `project_id eq ${this.$f7route.params.id} and `;
                }

                if (this.search_query !== null) {
                  filters += `(heading lk "%${ this.search_query }%" or tasks.id lk "${ this.search_query }%" ) and `;
                }

                // Add this when selected filter is done
                if (this.item.board_column.id !== 0 && this.item.board_column.id !== null) {
                  filters += `board_column_id eq "${ this.item.board_column.id }" and `;
                }
                if (this.hideCompletedTask) {
                  filters += `board_column_id ne "${ this.completedTaskBoardColumn }" and `;
                }
                if (this.item.project.id !== 0 && this.item.project.id !== null) {
                    filters += `project_id eq "${ this.item.project.id }" and `;
                }
                if (this.item.category.id !== 0 && this.item.category.id !== null) {
                    filters += `task_category_id eq "${ this.item.category.id }" and `;
                }
                if (this.item.client.id !== 0 && this.item.client.id !== null) {
                    filters += `project_client_id eq "${ this.item.client.id }" and `;
                }
                if (this.item.employee.id !== 0 && this.item.employee.id !== null) {
                    filters += `task_user_id eq "${ this.item.employee.id }" and `;
                }
                if (this.item.assignedBy.id !== 0 && this.item.assignedBy.id !== null) {
                    filters += `created_by eq "${ this.item.assignedBy.id }" and `;
                }
                // Remove trailing 'and' and encode for URI
                filters = encodeURIComponent(filters.substring(0, filters.length - 4));

                return filters;
            },

            show(item) {
                this.$f7router.navigate((this.selfUrl + item.id), {
                    query: {
                        item: item
                    },
                });
            },
            apply() {
                this.$f7.sheet.get('.task-filter').close();
                this.init();
            },
            onHideCompletedTaskChange: function (e) {
                this.hideCompletedTask = !!e.target.checked;
            },
            onSSOpen() {
                this.$f7.sheet.get('.task-filter').close();
            },
            onSSClose() {
                this.$f7.sheet.get('.task-filter').open();
            },
            onSheetOpen() {
                let projectSmartSelect = this.$f7.smartSelect.get('#projectSmartSelect .smart-select');
                projectSmartSelect.setValue(this.item.project.id);
                let clientSmartSelect = this.$f7.smartSelect.get('#clientSmartSelect .smart-select');
                clientSmartSelect.setValue(this.item.client.id);
                let assignedToSmartSelect = this.$f7.smartSelect.get('#assignedToSmartSelect .smart-select');
                assignedToSmartSelect.setValue(this.item.employee.id);
                let assignedBySmartSelect = this.$f7.smartSelect.get('#assignedBySmartSelect .smart-select');
                assignedBySmartSelect.setValue(this.item.assignedBy.id);
            },
            onSheetReset() {
                let projectSmartSelect = this.$f7.smartSelect.get('#projectSmartSelect .smart-select');
                projectSmartSelect.setValue(0);
                let clientSmartSelect = this.$f7.smartSelect.get('#clientSmartSelect .smart-select');
                clientSmartSelect.setValue(0);
                let assignedToSmartSelect = this.$f7.smartSelect.get('#assignedToSmartSelect .smart-select');
                assignedToSmartSelect.setValue(0);
                let assignedBySmartSelect = this.$f7.smartSelect.get('#assignedBySmartSelect .smart-select');
                assignedBySmartSelect.setValue(0);
                this.hideCompletedTask = true;
            },
        },
        computed:{
            setCompletedColumn() {
                if (this.columns){
                    return (_.find(this.columns, (item) => item.slug === 'completed')).id;
                }
                else{
                    return null;
                }
            },
        },
    };
</script>
<style>
label.item-checkbox > .icon-checkbox {
    margin-right: 5px;
}
</style>
