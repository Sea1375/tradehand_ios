<style type="text/css" scoped>
   #selected{
      background-color: rgba(0, 0, 0, 0.15);
   }
</style>
<template>
   <f7-page infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh" :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad" id="task-list">
      <!-- Top Navbar -->
      <f7-navbar :sliding="false" >
         <f7-nav-left>
            <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
         </f7-nav-left>
         <f7-nav-title >{{ trans('app.menu.estimates') }}</f7-nav-title>
         <f7-nav-right>
            <f7-link href="#"  sheet-open=".filter-actions" icon-f7="slider_horizontal_3"></f7-link>
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
          {{ trans('messages.noEstimatesFound') }}
      </f7-block>

      <f7-block class="search-list">
         <f7-card  v-for="item in items" v-bind:key="item.id" @click.native="show(item)">
            <f7-card-content>
               <f7-row>
                  <span>{{item.estimate_number}}</span>
               </f7-row>
               <f7-row>
                  <f7-col width="60" class="text-align-left">
                     <span class="user-name">{{item.client.name}}</span>
                  </f7-col>
                  <f7-col width="40" class="deadline text-align-right text-color-gray">
                     <f7-icon f7="calendar"></f7-icon>
                     {{ formatDueDate(item.valid_till) }}
                  </f7-col>
               </f7-row>
               <f7-row class="margin-top-half">
                  <f7-col class="text-color-gray"  width="70">
                     <template>{{item.currency.currency_symbol + item.total}}</template>
                  </f7-col>
                  <f7-col class="text-align-right deadline" width="30">
                     <f7-badge :style="`background-color:${formatStatusColor(item)}`">{{formatStatus(item.status)}}</f7-badge>
                  </f7-col>
               </f7-row>

            </f7-card-content>
         </f7-card>
      </f7-block>
      <f7-sheet
         class="filter-actions"
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
            <f7-list-item view=".view-main" sheet-close :title="formatStatus(state)"
               :id="(state === selectedFilter)? `selected` : ``"
               :key="index"
               @click="changeStatus(state)" v-for="(state,index) in status">

               <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
            </f7-list-item>
         </f7-list>
      </f7-sheet>
      <!-- FAB Right Bottom (Orange) -->
   </f7-page>
</template>

<script type="text/babel">
   import IndexMixin from '../../assets/vue/mixins/index';
   import CommonMixin from '../../assets/vue/mixins/common';
   import ModuleMixin from './mixin';

   export default {
      mixins: [IndexMixin, CommonMixin, ModuleMixin],
      data () {
         return {
            endpoint: 'estimate',
            fields: 'id,estimate_number,valid_till,total,status,client.limit(1000){id,name},currency.limit(1000){id,currency_code,currency_symbol}',
            order: "estimates.id desc",
            currentItem: [],
            status: ['all', 'declined', 'accepted', 'waiting', 'sent', 'draft'],
            selectedFilter: 'all',
            filters:''
         };
      },
      created () {
         this.pageId = Math.round(Math.random() * 100);
      },
      mounted () {

      },
      methods: {
         getFilters () {
         let filters = '';
            if (this.selectedFilter !== 'all') {
               filters += `status eq "${ this.selectedFilter }" and `;
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
      },
   };
</script>
