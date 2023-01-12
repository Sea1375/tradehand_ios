<style type="text/css">
    .badge-profile-image {
        height: 40px;
        width: 40px;
        border-radius: 50%;
    }
</style>
<template>
    <f7-page @page:init="pageLoad" ptr @ptr:refresh="pageLoad"
             @page:beforeout="onPageBeforeOut"
             @page:beforeremove="onPageBeforeRemove"
    >
        <f7-navbar :sliding="false" back-link="Back" layout="dark" theme="white">
            <f7-nav-title sliding v-if="item">{{ item.name }}</f7-nav-title>
            <f7-nav-right>
                <f7-link sheet-open=".client-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <template v-if="item">
            <f7-card id="employee-details">
                <f7-card-content>
                    <f7-row>
                        <f7-col width="25">
                            <img :src="item.image_url" width="54" height="54" class="lazy lazy-fade-in"/>
                        </f7-col>
                        <f7-col width="75">
                            <strong>{{item.name}}</strong>
                            <br />{{formatBadgeSubtitle(item)}}
                            <p>{{item.client_detail.company_name}}</p>
                        </f7-col>
                    </f7-row>
                </f7-card-content>
            </f7-card>

            <f7-block-title>{{ trans('modules.client.clientDetails') }}</f7-block-title>
            <f7-list media-list class="no-margin" v-if="item">
                <f7-list-item :title="trans('app.name')+':'" :after="item.client_detail.name"></f7-list-item>
                <f7-list-item :title="trans('app.email')+':'" :after="item.client_detail.email"></f7-list-item>
                <f7-list-item :title="trans('app.company_name')+':'" :after="item.client_detail.company_name"></f7-list-item>
                <f7-list-item :title="trans('modules.client.website')" :after="item.client_detail.website"></f7-list-item>
                <f7-list-item title="Skype:" :after="item.client_detail.skype"></f7-list-item>
                <f7-list-item :title="trans('modules.employees.status')" :badge="formatStatus(item)" :badge-color="formatStatusColor(item)"></f7-list-item>
            </f7-list>
            <f7-block v-if="item">&nbsp;</f7-block>
            <f7-sheet
                class="client-actions"
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
                endpoint: '/client',
                item: null,
                busy: false,
            };
        },
        mounted () {
            console.log(this.item);
        },
        methods: {
            init () {
                this.$f7.preloader.show();

                this.getItem().then(() => {
                    this.$f7.preloader.hide();
                    this.removePtrClass();
                });
            },
            pageLoad (page) {
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
                this.$f7.dialog.confirm(`${this.trans('messages.confirmation.clientDelete')}`, '', () => {
                    this.$f7.preloader.show();

                    this.$http.delete(`/client/${this.item.id}`).then((response) => {
                        this.$f7.preloader.hide();
                        Cache.removeMatching('client');
                        this.$store.commit('sendCacheInvalidate', 'client');
                        this.$f7router.back();
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
