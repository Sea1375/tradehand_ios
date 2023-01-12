<style type="text/css">
.badge-profile-image {
  height: 40px;
  width: 40px;
  border-radius: 50%;
}
.title-item {
  border-right: 1px solid #ccc;
  padding: 5px;
}
</style>
<template>
  <f7-page
    @page:init="pageLoad"
    @page:beforeout="onPageBeforeOut"
    @page:beforeremove="onPageBeforeRemove"
  >
    <f7-navbar :sliding="false" back-link="Back" layout="dark" theme="white">
      <f7-nav-title sliding v-if="item"
        >{{ trans("app.estimate") }}
        {{ item.estimate_number }}</f7-nav-title
      >
      <f7-nav-right v-if="item">
        <f7-link
          sheet-open=".estimate-actions"
          icon-f7="ellipsis_vertical"
        ></f7-link>
      </f7-nav-right>
    </f7-navbar>
    <template v-if="item">
      <f7-card>
        <f7-card-content>
          <f7-row class="text-align-center margin-bottom"
            ><f7-login-screen-title
              ><img
                :src="logo"
                class="login-screen-logo"/></f7-login-screen-title
          ></f7-row>
          <f7-row>
            <f7-col width="50" class="text-align-left">
              <b>{{ trans("modules.estimates.estimateTo") }}</b
              ><br />
              <b>{{ item.client.name }}</b>
            </f7-col>
            <f7-col width="50" class="text-align-right">
              <b>{{ trans("modules.estimates.createDate") }}</b
              ><br />
              <span>{{ formatDueDate(item.created_at) }}</span>
            </f7-col>
          </f7-row>
          <f7-row class="margin-top">
            <f7-col width="50" class="text-align-left">
              <b>{{ trans("modules.estimates.address") }}</b
              ><br />
              <span>{{ item.client.client_details.address }}</span>
            </f7-col>
            <f7-col width="50" class="text-align-right">
              <b>{{ trans("modules.estimates.validTill") }}:</b><br />
              <span>{{ formatDueDate(item.valid_till) }}</span
              ><br />
              <b>{{ trans("app.status") }}:</b><br />
              <f7-badge
                :style="`background-color:${formatStatusColor(item)}`"
                >{{ formatStatus(item.status) }}</f7-badge
              >
            </f7-col>
          </f7-row>
          <f7-block class="margin-top margin-bottom" v-if="item && item.items">
            <f7-row :style="`border:1px solid #ccc;`">
              <f7-col
                width="40"
                :style="`border-right:1px solid #ccc; padding:5px`"
                ><b>{{ trans("modules.estimates.item") }}</b></f7-col
              >
              <f7-col
                width="20"
                class="text-align-center"
                :style="`border-right:1px solid #ccc; padding:5px`"
                ><b>{{ trans("modules.estimates.price") }}</b></f7-col
              >
              <f7-col
                width="20"
                class="text-align-center"
                :style="`border-right:1px solid #ccc; padding:5px`"
                ><b>{{ trans("modules.estimates.qty") }}</b></f7-col
              >
              <f7-col
                width="20"
                class="text-align-center"
                :style="`padding:5px`"
                ><b>{{ trans("modules.estimates.total") }}</b></f7-col
              >
            </f7-row>
            <f7-row
              :style="`border:1px solid #ccc; border-top-width:0px;`"
              class=""
              v-for="estimateItem in item.items"
              :key="estimateItem.id"
            >
              <f7-col
                width="40"
                :style="`border-right:1px solid #ccc; padding:5px`"
                >{{ estimateItem.item_name }}</f7-col
              >
              <f7-col
                width="20"
                class="text-align-center"
                :style="`border-right:1px solid #ccc; padding:5px`"
                >{{ estimateItem.unit_price }}</f7-col
              >
              <f7-col
                width="20"
                class="text-align-center"
                :style="`border-right:1px solid #ccc; padding:5px`"
                >{{ estimateItem.quantity }}</f7-col
              >
              <f7-col
                width="20"
                class="text-align-center"
                :style="`padding:5px`"
                >{{ estimateItem.amount }}</f7-col
              >
            </f7-row>
            <f7-row class="margin-top">
              <f7-col width="40"></f7-col>
              <f7-col width="40" class="text-align-right margin-right">{{
                trans("modules.estimates.subtotal")
              }}</f7-col>
              <f7-col width="20" class="text-align-right"
                >{{ item.currency.currency_symbol }}{{ item.sub_total }}</f7-col
              >
            </f7-row>
            <f7-row
              v-if="estimateTaxes"
              v-for="(estimateTax, index) in estimateTaxes"
              :key="index"
            >
              <f7-col width="40"></f7-col>
              <f7-col width="40" class="text-align-right margin-right">{{
                index
              }}</f7-col>
              <f7-col width="20" class="text-align-right"
                >{{ item.currency.currency_symbol }}{{ estimateTax }}</f7-col
              >
            </f7-row>
            <f7-row v-if="item.discount && item.discount > 0">
              <f7-col width="40"></f7-col>
              <f7-col width="40" class="text-align-right margin-right"
                >{{ trans("modules.estimates.discount") }}
                {{
                  item.discount_type === "percent" ? "(%)" : "(Flat)"
                }}</f7-col
              >
              <f7-col width="20" class="text-align-right"
                >-{{ item.currency.currency_symbol
                }}{{
                  item.discount_type === "percent"
                    ? (estimateTotalAmount * item.discount) / 100
                    : item.discount
                }}</f7-col
              >
            </f7-row>
            <f7-row>
              <f7-col width="40"></f7-col>
              <f7-col width="40" class="text-align-right margin-right"
                ><b>{{ trans("modules.estimates.total") }}</b></f7-col
              >
              <f7-col width="20" class="text-align-right"
                ><b
                  >{{ item.currency.currency_symbol }}{{ item.total }}</b
                ></f7-col
              >
            </f7-row>
            <f7-row class="margin-top" v-if="item && item.note">
              <f7-col width="100" class="text-align-left">
                <b>{{ trans("modules.estimates.notes") }}:</b>
              </f7-col>
              <f7-col width="100">
                <span style="white-space: pre-line">{{ item.note }}</span>
              </f7-col>
            </f7-row>
          </f7-block>
        </f7-card-content>
      </f7-card>
      <f7-sheet
        class="estimate-actions"
        style="height:auto; --f7-sheet-bg-color: #fff;"
        swipe-to-close
        backdrop
      >
        <f7-toolbar bg-color="blue">
          <div class="left padding-left">{{ trans("app.action") }}</div>
          <div class="right">
            <f7-link sheet-close>{{ trans("app.close") }}</f7-link>
          </div>
        </f7-toolbar>

        <!-- Scrollable sheet content -->
        <f7-list>
          <f7-list-item
            v-if="item"
            view=".view-main"
            sheet-close
            :title="trans('modules.estimates.sendEstimate')"
            @click.prevent="sendEstimate(item)"
          >
            <f7-icon f7="envelope"></f7-icon>
          </f7-list-item>
        </f7-list>
      </f7-sheet>
    </template>
  </f7-page>
</template>

<script type="text/babel">
import CommonMixin from "../../assets/vue/mixins/common";
import ModuleMixin from "./mixin";

export default {
  mixins: [CommonMixin, ModuleMixin],
  data() {
    return {
      endpoint: "/estimate",
      item: null,
      invoiceTotalAmount: 0,
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
          this.$f7.preloader.hide();
        },
        () => {
          this.$f7.preloader.hide();
        }
      );
    },
    sendEstimate() {
      this.$f7.sheet.close();
      this.$f7.preloader.show();
      this.$http.get(`/estimate/send/${this.item.id}`).then(
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
    estimateTaxes() {
      this.estimateTotalAmount = this.item.sub_total;
      let appliedTaxes = [];
      const estimateItems = _.filter(
        this.item.items,
        (item) => item.taxes !== null
      );
      for (let j = 0; j < estimateItems.length; j++) {
        let estimateItemsTaxes = JSON.parse(estimateItems[j].taxes);
        for (let i = 0; i < estimateItemsTaxes.length; i++) {
          let getTax = _.filter(
            this.allTaxes,
            (item) => item.id === parseInt(estimateItemsTaxes[i])
          )[0];
          let estimateItemTax =
            (estimateItems[j].amount * getTax.rate_percent) / 100;
          let taxName = getTax.tax_name + ": (" + getTax.rate_percent + "%)";
          if (appliedTaxes.hasOwnProperty(taxName)) {
            appliedTaxes[taxName] = appliedTaxes[taxName] + estimateItemTax;
          } else {
            appliedTaxes[taxName] = estimateItemTax;
          }
          this.estimateTotalAmount = this.estimateTotalAmount + estimateItemTax;
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
