<template>
    <f7-page @page:init="pageLoad"
             @page:beforeout="onPageBeforeOut"
             ptr @ptr:refresh="pageLoad"
             @page:beforeremove="onPageBeforeRemove"
    >
        <f7-navbar :sliding="false" :back-link="true" layout="dark" theme="white" back-link="Back">
            <f7-nav-title sliding v-if="item">{{ trans('app.task') }}#{{item.id}}</f7-nav-title>
            <f7-nav-right>
                <f7-link sheet-open=".task-actions" icon-f7="ellipsis_vertical"></f7-link>
            </f7-nav-right>
        </f7-navbar>

        <template v-if="item">
            <f7-block>
                <f7-block-title text-color="blue">{{item.heading}}</f7-block-title>
                <f7-row>
                    <f7-col class="text-color-gray task-project" v-if="item.project">
                        <f7-icon f7="layers"></f7-icon>
                        {{ item.project.project_name }}
                    </f7-col>
                    <f7-col class="text-align-right" >
                        <f7-link sheet-open=".board-actions">
                            <badge :item="item"></badge>
                        </f7-link>

                    </f7-col>

                </f7-row>

                <f7-row class="margin-top">
                    <f7-col class="deadline text-color-gray">
                        {{ formatDueDate(item.start_date) }}
                        <f7-icon size="12px" f7="arrow_right" v-if="item.due_date"></f7-icon>
                        <span class="text-color-red" v-if="item.due_date">
                          {{ formatDueDate(item.due_date) }}
                        </span>
                    </f7-col>

                </f7-row>

                <f7-row class="margin-top">
                    <f7-col class="user-list">
                        <f7-link :tooltip="user.name" v-for="user in item.users" v-bind:key="user.id" v-if="item.users.length>0">
                            <img :src="user.image_url" width="25" height="25" class="lazy lazy-fade-in margin-right-half" />
                        </f7-link>
                    </f7-col>

                </f7-row>
            </f7-block>

            <template v-if="item.description">
                <f7-block-title>{{ trans('app.description') }}</f7-block-title>
                <f7-block>
                    <p v-html="item.description" id="description" @click="handleClick"></p>
                </f7-block>
            </template>


            <f7-toolbar tabbar labels position="bottom">
                <f7-link popup-open=".subtask-popup">
                    <f7-icon f7="text_badge_checkmark"></f7-icon>
                </f7-link>
<!--                <f7-link popup-open=".files-popup">-->
<!--                    <f7-icon f7="paperclip"></f7-icon>-->
<!--                </f7-link>-->
<!--                <f7-link>-->
<!--                    <f7-icon f7="bubble_left_bubble_right"></f7-icon>-->
<!--                </f7-link>-->
            </f7-toolbar>

            <f7-photo-browser
                    :photos="images"
                    type="popup"
                    theme="dark"
                    :toolbar="false"
                    ref="popup"
            ></f7-photo-browser>

            <f7-sheet
                    class="task-actions"
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
                    <f7-list-item view=".view-main" link="#" sheet-close :title="trans('modules.tasks.changeStatus')" @click="statusUpdate"></f7-list-item>
                    <f7-list-item view=".view-main" sheet-close :title="trans('modules.tasks.reminder')" @click="remind" ></f7-list-item>
                    <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')" @click.prevent="edit(item)"></f7-list-item>
                    <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')"></f7-list-item>
                </f7-list>
            </f7-sheet>
            <f7-sheet
                    class="board-actions"
                    style="height:auto; --f7-sheet-bg-color: #fff;"
                    swipe-to-close
                    backdrop>
                <f7-toolbar bg-color="blue">
                    <div class="left padding-left">{{ trans('modules.tasks.moveToBoard') }}</div>
                    <div class="right">
                        <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                    </div>
                </f7-toolbar>

                <!-- Scrollable sheet content -->
                <f7-list>
                    <f7-list-item view=".view-main" sheet-close :title="column.column_name"
                                  :key="column.id"
                                  @click="changeStatus(column)" v-for="column in item.all_board_columns" v-if="column.id !== item.board_column.id">
                        <f7-badge  :style="`background-color:${column.label_color}`"></f7-badge>

                    </f7-list-item>
                </f7-list>
            </f7-sheet>

            <!--    POP UPS        -->
            <f7-popup class="subtask-popup" @popup:closed="popupOpened = false" @popup:open="getItem()">
                <sub-task-list :item="item"></sub-task-list>
            </f7-popup>

            <f7-popup class="files-popup" @popup:closed="popupOpened = false" >
               <files-list :item="item"></files-list>
            </f7-popup>
        </template>
    </f7-page>
</template>

<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';

    import CommonMixin from '../../assets/vue/mixins/common';
    import ModuleMixin from './mixin';
    import SubTaskList from './sub-tasks/subtasks-list'
    import FilesList from './files/files'

    export default {
        mixins: [CommonMixin, ModuleMixin],
        data() {
            return {
                endpoint: '/task',
                item: null,
                busy: false,
            };
        },
        components: {
            'sub-task-list': SubTaskList,
            'files-list': FilesList
        },
        computed:{
          completeIncompleteText(){
              return this.item.board_column.slug === 'completed' ? 'Incomplete' : 'Complete'
          }
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
                // this.$f7router.navigate((this.selfUrl + item.id), {
                this.$f7router.navigate(this.selfUrl + item.id + '/edit',{
                    params: {
                        item: item
                    }
                });
            },

            remove() {
                this.$f7.dialog.confirm(`${this.trans('messages.confirmation.taskDelete')}`, '', () => {
                    this.$f7.preloader.show();

                    this.$http.delete(`/task/${this.item.id}`).then((response) => {
                        this.$f7.preloader.hide();
                        Cache.removeMatching('task');
                        this.$store.commit('sendCacheInvalidate', 'task');
                        this.$f7router.back();
                    }, (response) => {
                        this.$f7.preloader.hide();
                        this.$f7.dialog.alert(response.data.error.message);
                    });
                });
            },
            statusUpdate(){
                this.$f7.sheet.close('.task-actions');
                this.$f7.sheet.open('.board-actions');
            },
            changeStatus(column) {
                this.$f7.sheet.close();
                this.$f7.preloader.show();
                this.$http.put(`/task/${this.item.id}`,{board_column:column}).then((response) => {

                    this.$f7.preloader.hide();

                    Cache.removeMatching('task');
                    this.$store.commit('sendCacheInvalidate', 'task');

                    this.item.board_column = column;
                }, (response) => {
                    this.$f7.preloader.hide();
                    this.$f7.dialog.alert(response.data.error.message);
                });
            },
            remind() {
                this.$f7.sheet.close();
                this.$f7.preloader.show();
                this.$http.get(`/task/remind/${this.item.id}`).then((response) => {
                    this.$f7.preloader.hide();

                    const toast = this.$f7.toast.create({
                        text: response.data.message,
                        position: 'center',
                        closeTimeout: 2000,
                    });

                    toast.open();

                }, (response) => {
                    this.$f7.preloader.hide();
                    this.$f7.dialog.alert(response.data.error.message);
                });
            },

        },
    };
</script>
