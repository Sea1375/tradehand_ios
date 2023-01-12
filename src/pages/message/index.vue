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
         <f7-nav-title >{{ trans('app.menu.messages') }}</f7-nav-title>
         <f7-nav-right>
            <f7-link href="#"  sheet-open=".ticket-filter" icon-f7="slider_horizontal_3"></f7-link>
         </f7-nav-right>

      </f7-navbar>

      <f7-block v-if="!busy && items.length === 0" style="text-align: center;">
          {{ trans('messages.noMessage') }}
      </f7-block>

       <f7-block class="search-list">
           <f7-card v-for="item in items" v-bind:key="item.id" @click.native="show(item)">
               <f7-card-content>
                   <f7-row>
                       <f7-col width="10">
                           <img
                               :src="item.image_url"
                               width="25"
                               height="25"
                               class="lazy lazy-fade-in"
                           />
                       </f7-col>
                       <f7-col width="50">
                           <span class="project-name">{{item.name}}</span>
                       </f7-col>
                       <f7-col width="40" class="text-align-right">
                           <f7-badge>{{ item.user_other_role ? item.user_other_role : 'client' }}</f7-badge>
                       </f7-col>
                   </f7-row>
                   <f7-row class="margin-top">

                       <f7-col width="50">
                           <span> {{ item.last_message }}</span>
                       </f7-col>
                       <f7-col width="50" class="text-align-right text-color-gray task">
                           <f7-col :class="messageSeenClass(item.message_seen)">
                               <f7-icon f7="calendar"></f7-icon>
                               {{item.message_time}}
                           </f7-col>
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
                endpoint: 'userchat/user-list',
                filters:''
            };
        },
        created () {
            this.pageId = Math.round(Math.random() * 100);
        },
        mounted () {

        },
        computed:{
        },
        methods: {
            pageLoad (page) {
                this.init();
            },
            getFilters () {
                let filters = '';

                return filters;
            },
            show(item) {
                this.$f7router.navigate((this.selfUrl + item.id), {
                    query: {
                        item: item
                    },
                });
            },
            messageSeenClass(messageSeen) {
                if (messageSeen === 'no') {
                    return 'text-align-right text-color-red';
                }
                return 'text-align-right text-color-gray';
            },
        },
    };
</script>
