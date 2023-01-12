<style type="text/css" scoped>
    #selected {
        background-color: rgba(0, 0, 0, 0.15);
    }
</style>
<template>
    <f7-page infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh"
             :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad" id="task-list">
        <!-- Top Navbar -->
        <f7-navbar :sliding="false">
            <f7-nav-left>
                <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
            </f7-nav-left>
            <f7-nav-title>{{ trans('app.menu.leaves') }}</f7-nav-title>
            <f7-nav-right>
                <f7-link href="#" sheet-open=".filter-actions" icon-f7="slider_horizontal_3"></f7-link>
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
        <f7-block v-if="!busy && items.length === 0" style="text-align: center;">
            {{ trans('messages.noLeavesFound') }}
        </f7-block>

        <f7-block class="search-list">
            <f7-card v-for="item in items" v-bind:key="item.id" @click.native="show(item)">
                <f7-card-content>
                    <f7-row>
                        <f7-col width="10">
                            <img :src="item.user.image_url" width="25" height="25"
                                 class="lazy lazy-fade-in margin-right-half"/>
                        </f7-col>
                        <f7-col width="50" class="text-align-left">
                            <span class="user-name">{{item.user.name}}</span>
                        </f7-col>
                        <f7-col width="40" class="deadline text-align-right text-color-gray">
                            <f7-icon f7="calendar"></f7-icon>
                            {{ formatDueDate(item.leave_date) }}
                        </f7-col>
                    </f7-row>
                    <f7-row>
                        <f7-col width="100">
                            <span class="reason">{{item.reason}}</span>
                        </f7-col>
                    </f7-row>
                    <f7-row class="margin-top-half">
                        <f7-col class="text-color-gray" width="70">
                            <template>{{item.type.type_name}}</template>
                        </f7-col>
                        <f7-col class="text-align-right deadline" width="30">
                            <f7-badge :style="`background-color:${formatStatusColor(item)}`">
                                {{formatStatus(item.status)}}
                            </f7-badge>
                        </f7-col>
                    </f7-row>

                </f7-card-content>
            </f7-card>
        </f7-block>
        <f7-sheet
                class="filter-actions"
                style="height:auto; --f7-sheet-bg-color: #fff;"
                backdrop>
            <f7-toolbar bg-color="blue">
                <div class="left padding-left">{{ trans('app.filterResults') }}</div>
                <div class="right">
                    <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                </div>
            </f7-toolbar>

            <!-- Scrollable sheet content -->
            <f7-list>
                <f7-list-item view=".view-main" sheet-close :title="formatStatus(state)"
                              :id="(state === selectedFilter)? `selected` : ``"
                              :key="index"
                              @click="changeStatus(state)" v-for="(state,index) in status">

                    <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
                </f7-list-item>
            </f7-list>
        </f7-sheet>
        <!-- FAB Right Bottom (Orange) -->

        <!-- Extended FAB Center Bottom (Red) -->
        <f7-fab position="right-bottom" slot="fixed" :href="selfUrl+'create/'" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>
    </f7-page>
</template>

<script type="text/babel">
    import IndexMixin from '../../assets/vue/mixins/index';
    import CommonMixin from '../../assets/vue/mixins/common';
    import ModuleMixin from './mixin';

    export default {
        mixins: [IndexMixin, CommonMixin, ModuleMixin],
        data() {
            return {
                endpoint: 'leave',
                fields: 'id,leave_date,status,reason,user_id,user.limit(1000){id,name,image,image_url},type.limit(1000){id,type_name}',
                order: "leaves.id desc",
                currentItem: [],
                status: ['all', 'approved', 'pending', 'rejected'],
            };
        },
        created() {
            this.pageId = Math.round(Math.random() * 100);
        },
        mounted() {

        },
        methods: {
            getFilters() {
                let filters = '';
                if (this.search_query !== null) {
                    filters += `(status lk "${this.search_query}%" or employee_name lk "${this.search_query}%") and `;
                }

                // Filter from sheet
                if (this.selectedFilter !== 'all') {
                    filters += `status eq "${this.selectedFilter}" and `;
                }

                if (this.isEmployeeRoute) {
                    // This is employee self service route, add employee id filter
                    filters += `user_id eq ${this.$store.state.user.id} and `;
                }

                // Remove trailing 'and' and encode for URI
                filters = encodeURIComponent(filters.substring(0, filters.length - 4));
                return filters;
            },



            formatData(item) {
                return `${this.capitalize(item.name)} <span class="color-gray">(${this.capitalize(item.name)})</span>`;
            },
            remove(item) {

                this.$f7.dialog.confirm(`${this.trans('messages.confirmation.leaveDelete')}`, '', () => {
                    this.$f7.sheet.close();
                    this.$f7.preloader.show();

                    this.$http.delete(`/leave/${item.id}`).then(() => {
                        this.$f7.preloader.hide();
                        Cache.removeMatching('leave');
                        this.$store.commit('sendCacheInvalidate', 'leave');
                        this.$f7router.refreshPage();
                    }, (response) => {
                        this.$f7.preloader.hide();
                        this.$f7.dialog.alert(response.data.error.message);
                    });

                });
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
