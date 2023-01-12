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
         <f7-nav-title sliding v-if="item">Invoice {{ item.invoice_number }}</f7-nav-title>
         <f7-nav-right v-if="item && item.status !== 'canceled'">
            <f7-link sheet-open=".invoice-actions" icon-f7="ellipsis_vertical"></f7-link>
         </f7-nav-right>
      </f7-navbar>
      <template v-if="item">
         <f7-card>
            <f7-card-content>
               <f7-row class="text-align-center margin-bottom"><f7-login-screen-title><img :src="logo" class="login-screen-logo"/></f7-login-screen-title></f7-row>
               <f7-row>
                  <f7-col width="50" class="text-align-left">
                     <b>{{ trans('modules.invoices.billedTo') }}:</b><br />
                     <b v-if="this.invoiceClient">{{ this.invoiceClient.name }}</b>
<!--                     <b v-else-if="item.project && item.project.client">{{item.project.client.name}}</b>-->
                  </f7-col>
                  <f7-col width="50" class="text-align-right">
                     <b>{{ trans('modules.invoices.invoiceDate') }}:</b><br />
                     <span>{{ formatDueDate(item.issue_date) }}</span>
                  </f7-col>
               </f7-row>
               <f7-row class="margin-top">
                  <f7-col width="50" class="text-align-left">
                     <b>{{ trans('app.address') }}:</b><br />
                     <span v-if="item.client && item.client.client_details">{{ item.client.client_details.address }}</span>
                  </f7-col>
                  <f7-col width="50" class="text-align-right">
                     <b>{{ trans('modules.invoices.dueDate') }}:</b><br />
                     <span>{{ formatDueDate(item.due_date) }}</span><br />
                     <b>{{ trans('app.status') }}:</b><br />
                     <f7-badge :style="`background-color:${formatStatusColor(item)}`">{{formatStatus(item.status)}}</f7-badge>
                  </f7-col>
               </f7-row>
               <f7-block class="margin-top margin-bottom" v-if="item && item.items">
                  <f7-row :style="`border:1px solid #ccc;`">
                     <f7-col width="40" :style="`border-right:1px solid #ccc; padding:5px`"><b>{{ trans('modules.estimates.item') }}</b></f7-col>
                     <f7-col width="20" class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`"><b>{{ trans('modules.estimates.price') }}</b></f7-col>
                     <f7-col width="20" class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`"><b>{{ trans('modules.estimates.qty') }}</b></f7-col>
                     <f7-col width="20" class="text-align-center" :style="`padding:5px`"><b>{{ trans('modules.estimates.total') }}</b></f7-col>
                  </f7-row>
                  <f7-row :style="`border:1px solid #ccc; border-top-width:0px;`" class="" v-for="invoiceItem in item.items" :key="invoiceItem.id">
                     <f7-col width="40" :style="`border-right:1px solid #ccc; padding:5px`">{{ invoiceItem.item_name }}</f7-col>
                     <f7-col width="20" class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`">{{ invoiceItem.unit_price }}</f7-col>
                     <f7-col width="20" class="text-align-center" :style="`border-right:1px solid #ccc; padding:5px`">{{ invoiceItem.quantity }}</f7-col>
                     <f7-col width="20" class="text-align-center" :style="`padding:5px`">{{ invoiceItem.amount }}</f7-col>
                  </f7-row>
                  <f7-row class="margin-top">
                     <f7-col width="40"></f7-col>
                     <f7-col width="40" class="text-align-right margin-right">{{ trans('modules.estimates.subtotal') }}</f7-col>
                     <f7-col width="20" class="text-align-right">{{ item.currency.currency_symbol }}{{ item.sub_total }}</f7-col>
                  </f7-row>
                  <f7-row v-if="invoiceTaxes" v-for="(invoiceTax ,index) in invoiceTaxes" :key="index">
                     <f7-col width="40"></f7-col>
                     <f7-col width="40" class="text-align-right margin-right">{{ index }}</f7-col>
                     <f7-col width="20" class="text-align-right">{{ item.currency.currency_symbol }}{{ invoiceTax }}</f7-col>
                  </f7-row>
                  <f7-row v-if="item.discount && item.discount > 0">
                     <f7-col width="40"></f7-col>
                     <f7-col width="40" class="text-align-right margin-right">{{ trans('modules.estimates.discount') }} {{ item.discount_type === 'percent' ? '(%)' : '(Flat)' }}</f7-col>
                     <f7-col width="20" class="text-align-right">-{{ item.currency.currency_symbol }}{{ item.discount_type === 'percent' ? invoiceTotalAmount*item.discount/100 : item.discount }}</f7-col>
                  </f7-row>
                  <f7-row>
                     <f7-col width="40"></f7-col>
                     <f7-col width="40" class="text-align-right margin-right"><b>{{ trans('modules.estimates.total') }}</b></f7-col>
                     <f7-col width="20" class="text-align-right"><b>{{ item.currency.currency_symbol }}{{ item.total }}</b></f7-col>
                  </f7-row>
                  <f7-row class="margin-top" v-if="item && item.note">
                     <f7-col width="100" class="text-align-left">
                        <b>{{ trans('modules.estimates.notes') }}:</b>
                     </f7-col>
                     <f7-col width="100">
                        <span>{{ item.note }}</span>
                     </f7-col>
                  </f7-row>
               </f7-block>
            </f7-card-content>
         </f7-card>
         <f7-sheet
             class="invoice-actions"
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
            <f7-list>
               <f7-list-item v-if="item && item.status !== 'canceled'" view=".view-main" sheet-close title="Send Invoice" @click.prevent="sendInvoice(item)">
                  <f7-icon f7="envelope"></f7-icon>
               </f7-list-item>
            </f7-list>
         </f7-sheet>
      </template>
   </f7-page>
</template>

<script type="text/babel">
import Cache from "../../assets/vue/scripts/cache";

import CommonMixin from "../../assets/vue/mixins/common";
import ModuleMixin from "./mixin";

export default {
  mixins: [CommonMixin, ModuleMixin],
  data() {
    return {
      endpoint: "/invoice",
      item: null,
      invoiceTotalAmount: 0,
      invoiceClient: [],
      allTaxes: [],
      busy: false,
    };
  },
  mounted() {
    console.log(this.item);
  },
  methods: {
    init() {
      this.item = null;
      this.$f7.preloader.show();

      const promises = [];
      promises.push(this.getItem());
      promises.push(this.getTaxes());

      Promise.all(promises).then(
        () => {
          if (this.item && this.item.client) {
            this.invoiceClient = this.item.client;
          } else {
            if (this.item && this.item.project && this.item.project.client)
              this.invoiceClient = this.item.project.client;
          }
          this.$f7.preloader.hide();
        },
        () => {
          this.$f7.preloader.hide();
        }
      );
    },
    sendInvoice() {
      this.$f7.sheet.close();
      this.$f7.preloader.show();
      this.$http.get(`/invoice/send/${this.item.id}`).then(
        (response) => {
          const toast = this.$f7.toast.create({
            text: response.data.message,
            position: "center",
            closeTimeout: 2000,
          });

          toast.open();
          this.getItem().then(() => {
            this.$f7.preloader.hide();
          });
        },
        (response) => {
          this.$f7.preloader.hide();
          this.$f7.dialog.alert(response.data.error.message);
        }
      );
    },
    pageLoad(page) {
      this.init();
    },

    formatStatus() {
      return (
        this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1)
      );
    },
  },
  computed: {
    invoiceTaxes() {
      this.invoiceTotalAmount = this.item.sub_total;
      let appliedTaxes = [];
      const invoiceItems = _.filter(
        this.item.items,
        (item) => item.taxes !== null
      );
      for (let j = 0; j < invoiceItems.length; j++) {
        let invoiceItemsTaxes = JSON.parse(invoiceItems[j].taxes);
        for (let i = 0; i < invoiceItemsTaxes.length; i++) {
          let getTax = _.filter(
            this.allTaxes,
            (item) => item.id === parseInt(invoiceItemsTaxes[i])
          )[0];
          let invoiceItemTax =
            (invoiceItems[j].amount * getTax.rate_percent) / 100;
          let taxName = getTax.tax_name + ": (" + getTax.rate_percent + "%)";
          if (appliedTaxes.hasOwnProperty(taxName)) {
            appliedTaxes[taxName] = appliedTaxes[taxName] + invoiceItemTax;
          } else {
            appliedTaxes[taxName] = invoiceItemTax;
          }
          this.invoiceTotalAmount = this.invoiceTotalAmount + invoiceItemTax;
        }
      }
      return Object.assign({}, appliedTaxes);
    },
    logo() {
      if (this.$store.state.company !== null) {
        return this.$store.state.company.logo_url;
      }
    },
  },
};
</script>
