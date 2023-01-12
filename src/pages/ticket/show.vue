<style type="text/css">
  .badge-profile-image {
    height: 40px;
    width: 40px;
    border-radius: 50%;
  }
</style>
<template>
   <f7-page
      @page:init="pageLoad"
      @page:beforeout="onPageBeforeOut"
      @page:beforeremove="onPageBeforeRemove"
      >

      <f7-navbar :sliding="false"  back-link="Back" layout="dark" theme="white">
         <f7-nav-title sliding v-if="item">{{ trans('app.menu.ticket') }} #{{ item.id }}</f7-nav-title>
<!--         <f7-nav-right>-->
<!--            <f7-link sheet-open=".ticket-actions" icon-f7="ellipsis_vertical"></f7-link>-->
<!--         </f7-nav-right>-->
      </f7-navbar>
      <template v-if="item">
         <f7-list accordion-list>
            <f7-list-item accordion-item accordion-item-opened :title="trans('modules.tickets.ticketDetail')" >
               <f7-accordion-content>
                  <f7-list media-list class="no-margin" v-if="item">
                     <f7-list-item :title="trans('modules.tickets.requester')" :after="item.requester.name"></f7-list-item>
                     <f7-list-item :title="trans('modules.tickets.agent')" :after="item.agent ? item.agent.name : trans('modules.tickets.notAssigned')"></f7-list-item>
                     <f7-list-item :title="trans('modules.tickets.requestedOn')" :after="formatDueDate(item.created_at)"></f7-list-item>
                     <f7-list-item :title="trans('app.status')" :badge="formatStatus(item.status)" :badge-color="formatStatusColor(item)"></f7-list-item>
                     <f7-list-item :title="trans('modules.tickets.priority')" :after="formatStatus(item.priority)"></f7-list-item>
                  </f7-list>
               </f7-accordion-content>
            </f7-list-item>
         </f7-list>
         <f7-popup class="message-popup" :swipe-to-close="true" @popup:closed="popupOpened = false">
            <message :item="item" v-on:fetch="getItem"></message>
         </f7-popup>
<!--         <message></message>-->
         <f7-toolbar tabbar labels position="bottom">
            <f7-link tab-link-active text="Overview" icon-ios="f7:layers"
                     icon-aurora="f7:layers" icon-md="material:layers"></f7-link>
            <f7-link popup-open=".message-popup" :text="trans('modules.tickets.replies')" icon-ios="f7:chat_bubble_text" icon-aurora="f7:chat_bubble_text"
                     icon-md="material:chat_bubble_text"></f7-link>
         </f7-toolbar>
         <f7-sheet
            v-if="!isEmployeeRoute"
            class="ticket-actions"
            style="height:auto; --f7-sheet-bg-color: #fff;"
            swipe-to-close
            backdrop>
            <f7-toolbar bg-color="blue">
               <div class="left padding-left">{{ trans('app.action') }}</div>
               <div class="right">
                  <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
               </div>
            </f7-toolbar>
            <!-- Scrollable sheet content -->
            <f7-list v-if="item && isEmployeeRoute && item.status === 'pending'">
<!--               <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')" @click.prevent="edit(item)">-->
<!--                  <f7-icon f7="pencil"></f7-icon>-->
<!--               </f7-list-item>-->
               <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')">
                  <f7-icon f7="trash"></f7-icon>
               </f7-list-item>
            </f7-list>
            <f7-list v-else-if="!isEmployeeRoute">
<!--               <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')" @click.prevent="edit(item)">-->
<!--                  <f7-icon f7="pencil"></f7-icon>-->
<!--               </f7-list-item>-->
               <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')">
                  <f7-icon f7="trash"></f7-icon>
               </f7-list-item>
            </f7-list>
         </f7-sheet>
      </template>
   </f7-page>
</template>

<script type="text/babel">
   import Cache from '../../assets/vue/scripts/cache';
   import Message from './message'
   import CommonMixin from '../../assets/vue/mixins/common';
   import ModuleMixin from './mixin';

   export default {
      mixins: [CommonMixin, ModuleMixin],
      data () {
         return {
            endpoint: '/ticket',
            item: null,
            busy: false,
         };
      },
      components: {
         Message,
      },
      mounted () {
         // console.log(this.item);
      },
      methods: {
         init () {
            this.item = null;
            this.$f7.preloader.show();
            this.getItem().then(() => {
               this.$f7.preloader.hide();
            });
         },
         pageLoad (page) {
            this.init()
         },

         edit (item) {
            this.$f7router.navigate(this.selfUrl + item.id + '/edit',{
               params: {
                  item: item
               }
            });
         },

         remove () {
            this.$f7.dialog.confirm(`${this.trans('messages.confirmation.ticketDelete')}`, '', () => {
               this.$f7.sheet.close();
               this.$f7.preloader.show();

               this.$http.delete(`/ticket/${ this.item.id }`).then(() => {
                  this.$f7.preloader.hide();
                  Cache.removeMatching('ticket');
                  this.$store.commit('sendCacheInvalidate', 'ticket');
                  this.$f7router.back();
               }, (response) => {
                  this.$f7.preloader.hide();
                  this.$f7.dialog.alert(response.data.error.message);
               });

            });
         },

         // formatStatus () {
         //    return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
         // },
      },
   };
</script>
