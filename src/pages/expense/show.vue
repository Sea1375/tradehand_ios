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
         <f7-nav-title sliding v-if="item">{{ trans('app.expense') }}</f7-nav-title>
         <f7-nav-right>
            <f7-link sheet-open=".expense-actions" icon-f7="ellipsis_vertical"></f7-link>
         </f7-nav-right>
      </f7-navbar>
      <template v-if="item">
         <f7-block-title>{{ trans('app.expense') }}</f7-block-title>
         <f7-list media-list class="no-margin" v-if="item">
            <f7-list-item :title="trans('app.employee')" :after="item.user.name"></f7-list-item>
            <f7-list-item :title="trans('modules.expenses.itemName')" :after="item.item_name"></f7-list-item>
           <f7-list-item :title="trans('modules.expenses.purchaseDate')" :after="formatDueDate(item.purchase_date)"></f7-list-item>
           <f7-list-item :title="trans('modules.expenses.purchaseFrom')" :after="item.purchase_from"></f7-list-item>
           <f7-list-item :title="trans('app.price')" :after="item.currency.currency_symbol + item.price"></f7-list-item>
<!--           <f7-list-item :title="trans('app.bill')" >-->
<!--              <f7-link slot="after" href="#" @click="downloadImage(item.bill_url)">{{ trans('app.download') }}</f7-link>-->
<!--           </f7-list-item>-->
           <f7-list-item v-if="item.project" :title="trans('app.project')" :after="item.project.project_name"></f7-list-item>
           <f7-list-item :title="trans('app.status')" :badge="formatStatus(item.status)" :badge-color="formatStatusColor(item)"></f7-list-item>
         </f7-list>
         <f7-toolbar v-if="item && item.status === 'pending' && !isEmployeeRoute" :bottom="true">
            <f7-link href="#" @click.prevent="accept" icon-ios="f7:check"
                         icon-aurora="f7:check" icon-md="material:check" icon-color="white" :text="trans('app.accept')"></f7-link>
            <f7-link href="#" @click.prevent="reject" icon-ios="f7:close"
                         icon-aurora="f7:close" icon-md="material:close" icon-color="red" :text="trans('app.reject')"></f7-link>
        </f7-toolbar>

         <f7-sheet
            class="expense-actions"
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
               <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')" @click.prevent="edit(item)">
                  <f7-icon f7="pencil"></f7-icon>
               </f7-list-item>
               <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')">
                  <f7-icon f7="trash"></f7-icon>
               </f7-list-item>
            </f7-list>
            <f7-list v-else-if="!isEmployeeRoute">
               <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')" @click.prevent="edit(item)">
                  <f7-icon f7="pencil"></f7-icon>
               </f7-list-item>
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

   import CommonMixin from '../../assets/vue/mixins/common';
   import ModuleMixin from './mixin';

   export default {
      mixins: [CommonMixin, ModuleMixin],
      data () {
         return {
            endpoint: '/expense',
            item: null,
            busy: false,
         };
      },
      mounted () {
         console.log(this.item);
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
         billDownload (url) {
            if (url) {
               return `<a href="#">${this.trans('app.download')}</a>`;
            }
            else {
               return '@';
            }
         },
         downloadImage (url) {
            cordova.InAppBrowser.open(url, '_blank');
            // cordova.InAppBrowser.open(url, '_blank');
         },

         edit (item) {
            this.$f7router.navigate(this.selfUrl + item.id + '/edit',{
               params: {
                  item: item
               }
            });
         },

         remove () {
            this.$f7.dialog.confirm(`${this.trans('messages.confirmation.expenseDelete')}`, '', () => {
               this.$f7.sheet.close();
               this.$f7.preloader.show();

               this.$http.delete(`/expense/${ this.item.id }`).then(() => {
                  this.$f7.preloader.hide();
                  Cache.removeMatching('expense');
                  this.$store.commit('sendCacheInvalidate', 'expense');
                  this.$f7router.back();
               }, (response) => {
                  this.$f7.preloader.hide();
                  this.$f7.dialog.alert(response.data.error.message);
               });

            });
         },

         accept() {
            this.$f7.dialog.confirm(`${this.trans('messages.confirmation.approveExpense')}`, '', () => {
               this.$f7.sheet.close();
               this.$f7.preloader.show();
               this.$http.put(`/expense/${this.item.id}`, {status: 'approved'}).then((response) => {

                  this.$f7.preloader.hide();

                  Cache.removeMatching('expense');
                  this.$store.commit('sendCacheInvalidate', 'expense');

                  this.item.status = 'approved';
               }, (response) => {
                  this.$f7.preloader.hide();
                  this.$f7.dialog.alert(response.data.error.message);
               });
            });
         },
         reject() {
            this.$f7.dialog.confirm(`${this.trans('messages.confirmation.rejectExpense')}`, '', () => {

               // this.$f7.sheet.close();
               this.$f7.preloader.show();
               this.$http.put(`/expense/${this.item.id}`, {status: 'rejected'}).then((response) => {

                  this.$f7.preloader.hide();

                  Cache.removeMatching('expense');
                  this.$store.commit('sendCacheInvalidate', 'expense');

                  this.item.status = 'rejected';
               }, (response) => {
                  this.$f7.preloader.hide();
                  this.$f7.dialog.alert(response.data.error.message);
               });
            });
         },

         formatStatus () {
            return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
         },
      },
   };
</script>
