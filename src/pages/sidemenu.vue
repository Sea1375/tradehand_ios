<style type="text/css">
    .side-menu{
        background-color: #ffffff;
    }
    #left-panel-view .page-content {
      background-color: #fff;
    }
</style>
<template>
    <f7-view id="left-panel-view" navbar-through>
        <f7-page>
            <f7-navbar class="no-border">
                <f7-list media-list id="navbar-user" v-if="$store.state.user">
                    <f7-list-item
                            :media="$store.state.user.image_url"
                            :title="$store.state.user.name"
                    ></f7-list-item>
                </f7-list>
            </f7-navbar>
            <template class="side-menu">
                <f7-toolbar tabbar theme="orange" position="top"  v-if="$store.state.user.user_other_role !=='employee'">
                    <f7-link tab-link="#employee-menu" tab-link-active>{{ trans('app.employee') }}</f7-link>
                    <f7-link tab-link="#admin-menu">{{ trans('app.admin') }}</f7-link>
                </f7-toolbar>
                <f7-tabs>
                    <f7-tab id="employee-menu" tab-active>
                        <f7-list class="no-border  side-menu">
                            <f7-list-item link="/self/" :title="trans('app.menu.dashboard')" view=".view-main" panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'leads'"link="/self/leads/" :title="trans('app.menu.leads')" view=".view-main" panel-close ></f7-list-item>
                            <f7-list-item v-snap-permission="'projects'" link="/self/projects/" :title="trans('app.menu.projects')" view=".view-main"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'projects'" link="/self/timer/" :title="trans('app.timer')" view=".view-main"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'tasks'" link="/self/tasks/" :title="trans('app.menu.tasks')" view=".view-main" panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'notices'" link="/self/notice/" view=".view-main" title="Notice Board"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'leaves'" link="/self/leaves/" view=".view-main" :title="trans('app.menu.leaves')" panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'expenses'" link="/self/expenses/" view=".view-main" title="Expense"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'messages'" link="/messages/" view=".view-main" :title="trans('app.menu.messages')"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'tickets'" link="/self/tickets/" view=".view-main" :title="trans('app.menu.tickets')"
                                          panel-close></f7-list-item>
                            <f7-list-item link="/about/" view=".view-main" :title="trans('app.about')" panel-close></f7-list-item>
                            <f7-list-item :title="trans('app.logout')" @click="logout()" panel-close></f7-list-item>
                        </f7-list>
                    </f7-tab>
                    <f7-tab id="admin-menu" v-if="$store.state.user.user_other_role !=='employee'">
                        <f7-list class="no-border  side-menu">

                            <f7-list-item link="/" :title="trans('app.menu.dashboard')" view=".view-main" panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'employees'" link="/employees/":title="trans('app.menu.employees')" view=".view-main" panel-close
                                          v-if="$store.state.user.user_other_role !=='employee'"></f7-list-item>
                            <f7-list-item link="/clients/" title="Clients" view=".view-main" panel-close
                                          v-if="$store.state.user.user_other_role !=='employee'"></f7-list-item>
                            <f7-list-item v-snap-permission="'leads'"link="/leads/" :title="trans('app.menu.leads')" view=".view-main" panel-close ></f7-list-item>
                            <f7-list-item v-snap-permission="'projects'" link="/projects/" title="Projects" view=".view-main"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'tasks'" link="/tasks/" :title="trans('app.menu.tasks')" view=".view-main" panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'attendance'" link="/attendance/" title="Attendance" view=".view-main" panel-close></f7-list-item>

                            <f7-list-item v-snap-permission="'invoices'" link="/invoices/" view=".view-main" :title="trans('app.menu.invoices')"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'estimates'" link="/estimates/" view=".view-main" :title="trans('app.menu.estimates')"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'leaves'" link="/leaves/" view=".view-main" :title="trans('app.menu.leaves')" panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'expenses'" link="/expenses/" view=".view-main" :title="trans('app.menu.expenses')"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'tickets'" link="/tickets/" view=".view-main" :title="trans('app.menu.tickets')"
                                          panel-close></f7-list-item>
                            <f7-list-item v-snap-permission="'messages'" link="/messages/" view=".view-main" :title="trans('app.menu.messages')"
                                          panel-close></f7-list-item>
                            <f7-list-item link="/calendar/" view=".view-main" :title="trans('app.menu.calendar')"
                                          panel-close></f7-list-item>
                            <f7-list-item link="/about/" view=".view-main" :title="trans('app.about')" panel-close></f7-list-item>
                            <f7-list-item :title="trans('app.logout')" @click="logout()" panel-close></f7-list-item>
                        </f7-list>
                    </f7-tab>
                </f7-tabs>
            </template>
        </f7-page>
    </f7-view>
</template>

<script>
    import CommonMixin from "../assets/vue/mixins/common";

    export default {
        mixins: [CommonMixin],
        name: "side-menu",
        methods: {
            logout() {

                const self = this;
                self.$f7.preloader.show();
                this.$f7.panel.close();

                const postData = {
                    device_id: window.localStorage.getItem('crm_device_id'),
                };
                this.$http.post('/device/unregister', postData);

                // Timeout just for animation so that user does not feel abrupt logout
                setTimeout(() => {
                    self.$store.dispatch('logout');
                    let mainView = self.$f7.view.main;
                    mainView.router.refreshPage();
                    self.$f7.preloader.hide();
                }, 1000);

            },
        }
    }
</script>

<style scoped>

</style>
