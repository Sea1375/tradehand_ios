<template>
    <f7-page hide-toolbar-on-scroll @page:init="pageLoad" ptr @ptr:refresh="pageLoad" @page:beforeout="onPageBeforeOut"
             @page:beforeremove="onPageBeforeRemove">
        <f7-navbar :sliding="false" back-link="Back" layout="dark" theme="white">
            <f7-nav-title sliding v-if="item">{{ item.name }}</f7-nav-title>
            <f7-nav-right>
                <f7-link sheet-open=".lead-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <template v-if="item">
            <f7-block-title>{{ trans('modules.lead.leadDetails') }}</f7-block-title>
            <f7-list media-list class="no-margin" v-if="item">
                <f7-list-item :title="trans('modules.lead.clientName')" :after="item.client_name"></f7-list-item>
                <f7-list-item :title="trans('modules.lead.clientEmail')" :after="item.client_email"></f7-list-item>
                <f7-list-item :title="trans('modules.lead.companyName')" :after="item.company_name"></f7-list-item>
                <f7-list-item :title="trans('modules.lead.website')" :after="item.website"></f7-list-item>
                <f7-list-item :title="trans('modules.lead.mobile')" :after="item.mobile"></f7-list-item>
                <f7-list-item v-if="item.lead_source" :title="trans('modules.lead.leadSource')" :after="item.lead_source.type"></f7-list-item>
                <f7-list-item v-if="item.lead_agent" :title="trans('modules.lead.leadAgent')" :after="item.lead_agent.user.name"></f7-list-item>
                <f7-list-item v-if="item.category" :title="trans('modules.lead.leadCategory')" :after="item.category.category_name"></f7-list-item>
                <f7-list-item v-if="item.lead_status">
                    <div class="display-flex justify-content-space-between align-items-flex-start">
                        <div class="flex-shrink-0">{{ trans('modules.lead.status') }}</div>
                        <div class="align-self-flex-end">
                            <f7-badge :style="`background-color:${item.lead_status.label_color}`"
                            >{{ this.capitalize(item.lead_status.type) }}</f7-badge>
                        </div>
                    </div>
                </f7-list-item>
            </f7-list>
            <f7-block v-if="item">&nbsp;</f7-block>
            <f7-sheet
                class="lead-actions"
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
                    <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')" @click.prevent="edit(item)"></f7-list-item>
                    <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')"></f7-list-item>
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
                endpoint: '/lead',
                item: null,
                busy: false,
            };
        },
        mounted () {
            console.log(this.item);
        },
        methods: {
            init() {
                this.item = null;

                this.$f7.preloader.show();

                this.getItem().then(() => {
                    this.$f7.preloader.hide();
                    this.removePtrClass();
                });
            },
            pageLoad(page) {
                this.init()
            },

            edit (item) {
                this.$f7.sheet.close();
                // this.$f7router.navigate((this.selfUrl + item.id), {
                this.$f7router.navigate(this.selfUrl + item.id + '/edit',{
                    params: {
                        item: item
                    }
                });
            },

            remove() {
                this.$f7.dialog.confirm(`${this.trans('messages.confirmation.leadDelete')}`, '', () => {
                    this.$f7.preloader.show();

                    this.$http.delete(`/lead/${this.item.id}`).then((response) => {
                        this.$f7.preloader.hide();
                        Cache.removeMatching('lead');
                        this.$store.commit('sendCacheInvalidate', 'lead');
                        this.$f7router.back();
                    }, (response) => {
                        this.$f7.preloader.hide();
                        this.$f7.dialog.alert(response.data.error.message);
                    });
                });
            },

        },
    };
</script>
