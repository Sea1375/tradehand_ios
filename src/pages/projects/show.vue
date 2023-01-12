<style type="text/css">
    .badge-profile-image {
        height: 40px;
        width: 40px;
        border-radius: 50%;
    }
    .page > .toolbar{
      min-height: 56px;
    }
</style>
<template>
    <f7-page hide-toolbar-on-scroll @page:init="pageLoad" ptr @ptr:refresh="pageLoad">

        <f7-navbar :sliding="false" back-link="Back">
            <f7-nav-title sliding v-if="item">{{item.project_name}}</f7-nav-title>
            <f7-nav-right v-if="!isEmployeeRoute">
                <f7-link sheet-open=".project-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>
        <template v-if="item">
            <f7-block class="margin-bottom-half">
                <f7-row class="margin-top no-margin-bottom">
                    <f7-col>
                        <f7-block-title class="no-margin">{{ trans('modules.projects.projectDetails') }}</f7-block-title>
                    </f7-col>
                    <f7-col class="text-align-right">
                        <f7-link sheet-open=".status-actions">
                            <f7-badge :color="formatStatusColor(item)">{{formatStatus(item)}}</f7-badge>
                        </f7-link>

                    </f7-col>
                </f7-row>
            </f7-block>
            <f7-block strong v-if="item.project_summary" class="no-margin-top">
                <p v-html="item.project_summary" id="description" @click="handleClick"></p>
            </f7-block>
            <f7-block strong v-else> &nbsp;</f7-block>

            <f7-block v-if="!isEmployeeRoute">
                <f7-row class="margin-top">
                    <f7-col>
                        <strong class="text-color-purple">{{item.currency ? item.currency.currency_symbol : ''}}{{item.project_budget?item.project_budget:'-'}}</strong>
                        <br/>{{ trans('modules.projects.projectBudget') }}
                    </f7-col>
                    <f7-col>
                        <strong class="text-color-green">{{item.currency ? item.currency.currency_symbol : ''}}{{item.total_earnings?item.total_earnings:'0'}}</strong>
                        <br/>{{ trans('app.earnings') }}
                    </f7-col>
                </f7-row>
                <f7-row class="margin-top">
                    <f7-col>
                        <strong class="text-color-blue">{{item.hours_allocated ? item.hours_allocated:'-'}}</strong>
                        <br/>{{ trans('modules.projects.hours_allocated') }}
                    </f7-col>

                </f7-row>
            </f7-block>

            <f7-block-title>{{ trans('app.client') }}</f7-block-title>
            <f7-block strong v-if="this.applicationName() === 'worksuite-saas'">
                <f7-row strong v-if="item.clientdetails && item.clientdetails.user">
                    <f7-col width="25" class="user-list">
                        <img :src="item.clientdetails.user.image_url" width="54" height="54" class="lazy lazy-fade-in"/>
                    </f7-col>
                    <f7-col width="75">
                        <strong>{{item.clientdetails.user.name}}</strong>
                        <br/>{{item.clientdetails.user.email}}
                        <br/>
                        <span class="text-color-gray" v-if="item.client_details">{{item.client_details.company_name}}</span>
                    </f7-col>
                </f7-row>
                <f7-row  v-else>
                    <f7-col class="text-align-center">
                        <span class="text-color-gray"> {{ trans('modules.projects.noClientFound') }} </span>
                    </f7-col>
                </f7-row>
            </f7-block>
            <f7-block strong v-if="this.applicationName() === 'worksuite'">
                <f7-row strong v-if="item.client">
                    <f7-col width="25" class="user-list">
                        <img :src="item.client.image_url" width="54" height="54" class="lazy lazy-fade-in"/>
                    </f7-col>
                    <f7-col width="75">
                        <strong>{{item.client.name}}</strong>
                        <br/>{{item.client.email}}
                        <br/>
                        <span class="text-color-gray" v-if="item.client.client_details">{{item.client.client_details.company_name}}</span>
                    </f7-col>
                </f7-row>
                <f7-row  v-else>
                    <f7-col class="text-align-center">
                        <span class="text-color-gray"> {{ trans('modules.projects.noClientFound') }} </span>
                    </f7-col>
                </f7-row>
            </f7-block>

            <f7-block-title>{{ trans('modules.projects.members') }}</f7-block-title>
            <f7-block strong>
                <f7-row  v-if="item.members && item.members.length>0">
                    <f7-col class="user-list">
                        <f7-link :tooltip="member.name" v-for="member in item.members" v-bind:key="member.id" v-if="item.members.length>0">
                            <img :src="member.image_url" width="25" height="25" class="lazy lazy-fade-in margin-right-half" />
                        </f7-link>
                    </f7-col>
                </f7-row>
                <f7-row  v-else>
                    <f7-col class="text-align-center">
                        <span class="text-color-gray"> {{ trans('messages.noMemberAddedToProject') }} </span>
                    </f7-col>
                </f7-row>
            </f7-block>

            <f7-block>
                <f7-row class="margin-top">

                    <f7-col>
                        <strong class="text-color-blue">{{formatDate(item)}}</strong>
                        <br/>{{ trans('modules.projects.deadline') }}
                    </f7-col>
                    <f7-col>
                        <strong class="text-color-green">{{item.hours_logged ? item.hours_logged:'-'}}</strong>
                        <br/>{{ trans('modules.projects.hoursLogged') }}
                    </f7-col>

                </f7-row>
            </f7-block>

            <f7-popup class="demo-popup" @popup:closed="popupOpened = false">
                <f7-page>
                    <f7-navbar :title="trans('modules.projects.projectDetails')">
                        <f7-nav-right>
                            <f7-link popup-close>{{ trans('app.close') }}</f7-link>
                        </f7-nav-right>
                    </f7-navbar>
                    <f7-block>
                        <p v-html="item.project_summary" @click="handleClick"></p>

                    </f7-block>
                </f7-page>
            </f7-popup>

            <f7-popup class="member-popup" :swipe-to-close="true" @popup:closed="popupOpened = false">
                <members-list :item="item" v-on:fetch="getItem"></members-list>
            </f7-popup>


            <f7-toolbar tabbar labels position="bottom">
                <f7-link tab-link-active text="Overview" icon-ios="f7:layers"
                         icon-aurora="f7:layers" icon-md="material:layers"></f7-link>
                <f7-link popup-open=".member-popup" text="Members" icon-ios="f7:person_2" icon-aurora="f7:person_2"
                         icon-md="material:people"></f7-link>
                <f7-link v-snap-permission="'tasks'" :href="`/project/${item.id}/${isEmployeeRoute ? 'self/' : ''}tasks`" text="Tasks" icon-ios="f7:checkmark_square"
                         icon-aurora="f7:checkmark_square" icon-md="material:check_box"></f7-link>
            </f7-toolbar>

            <f7-sheet
                    class="status-actions"
                    style="height:auto; --f7-sheet-bg-color: #fff;"
                    swipe-to-close
                    backdrop>
                <f7-toolbar bg-color="blue">
                    <div class="left padding-left">{{ trans('app.status') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>

                <!-- Scrollable sheet content -->
                <f7-list>
                    <f7-list-item view=".view-main" sheet-close :title="capitalize(state)"
                          :key="index"
                          @click="changeStatus(state)" v-for="(state,index) in status" v-if="state !== item.status">

                        <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
                    </f7-list-item>
                </f7-list>
            </f7-sheet>

            <f7-sheet
                    class="project-actions"
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
                    <f7-list-item view=".view-main" sheet-close title="Edit" @click.prevent="edit(item)">
                        <f7-icon f7="pencil"></f7-icon>
                    </f7-list-item>
                    <f7-list-item view=".view-main" @click="remove" title="Delete">
                        <f7-icon f7="trash"></f7-icon>
                    </f7-list-item>
                </f7-list>
            </f7-sheet>
        </template>
        <f7-photo-browser
                :photos="images"
                type="popup"
                theme="dark"
                :toolbar="false"
                ref="popup"
        ></f7-photo-browser>


    </f7-page>

</template>

<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';

    import CommonMixin from '../../assets/vue/mixins/common';
    import ModuleMixin from './mixin';
    import Tasks from '../tasks/index'
    import MembersList from './members/members-list'

    export default {
        mixins: [CommonMixin, ModuleMixin],
        components: {
            Tasks,
            MembersList
        },
        data() {
            return {
                endpoint: 'project',
                item: null,
                busy: false,
                status: ['finished', 'in progress', 'not started', 'canceled', 'on hold']
            };
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

            edit(item) {
                this.$f7.sheet.close();
                this.$f7router.navigate('/project/' + item.id + '/edit',{
                    params: {
                        item: item
                    }
                });
            },

            remove() {
                this.$f7.dialog.confirm(`${this.trans('messages.confirmation.projectDelete')}`, '', () => {
                    this.$f7.sheet.close();
                    this.$f7.preloader.show();

                    this.$http.delete(`/project/${this.item.id}`).then((response) => {
                        this.$f7.preloader.hide();
                        Cache.removeMatching('project');
                        this.$store.commit('sendCacheInvalidate', 'project');
                        this.$f7router.back();
                    }, (response) => {
                        this.$f7.preloader.hide();
                        this.$f7.dialog.alert(response.data.error.message);
                    });
                });
            },
            changeStatus(status) {
                this.$f7.sheet.close();
                this.$f7.preloader.show();
                this.$http.put(`/project/${this.item.id}`, {status: status}).then((response) => {

                    this.$f7.preloader.hide();

                    Cache.removeMatching('project');
                    this.$store.commit('sendCacheInvalidate', 'project');

                    this.item.status = status;
                }, (response) => {
                    this.$f7.preloader.hide();
                    this.$f7.dialog.alert(response.data.error.message);
                });
            },

            formatStatus() {
                return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
            },

        },
    };
</script>
