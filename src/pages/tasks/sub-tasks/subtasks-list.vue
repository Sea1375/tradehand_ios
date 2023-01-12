<template>
    <f7-page>
        <f7-navbar :title="`${trans('app.task')} #${item.id} | ${trans('modules.tasks.subTask')}`">
            <f7-nav-right>
                <f7-link popup-close>{{ trans('app.close') }}</f7-link>
            </f7-nav-right>
        </f7-navbar>

        <f7-block>
            <template>
                <f7-block v-for="(subtask,index) in filteredList" v-bind:key="subtask.id">
                    <f7-row class="margin-top-half">
                        <f7-col width="10">
                            <f7-checkbox :checked="subtask.status==='complete'"
                                         @change="checkUncheck(subtask,index)"></f7-checkbox>
                        </f7-col>
                        <f7-col width="60">
                            {{subtask.title}}
                        </f7-col>
                        <f7-col width="20">
                            {{formatDueDate(subtask.due_date)}}
                        </f7-col>
                        <f7-col width="10">
                            <f7-link @click="remove(subtask)">
                                <f7-icon f7="trash_circle_fill" color="red"></f7-icon>
                            </f7-link>

                        </f7-col>
                    </f7-row>
                </f7-block>
                <f7-block v-if="!busy && item.subtasks.length === 0" style="text-align: center;">
                    {{ trans('modules.tasks.noSubTaskFound') }}
                </f7-block>
            </template>

        </f7-block>

        <sub-task-create :item="item" v-on:fetch="getItem"></sub-task-create>

        <!-- Extended FAB Center Bottom (Red) -->
        <f7-fab position="right-bottom" slot="fixed" @click="$f7.popup.open('.new-sub-task-popup')" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>

    </f7-page>
</template>

<script>
    import Cache from '../../../assets/vue/scripts/cache';
    import ModuleMixin from '../mixin';

    import SubTaskCreate from './create'
    import CommonMixin from "../../../assets/vue/mixins/common";

    export default {
        mixins: [CommonMixin, ModuleMixin],
        props: ['item'],
        name: "subtasks",
        data() {
            return {
                busy: false,
            };
        },
        components: {
            SubTaskCreate
        },
        computed: {
            filteredList() {
                return this.item.subtasks;
            }
        },
        methods: {
            checkUncheck(subtask, index) {
                this.$f7.preloader.show();
                this.busy = true;

                const newStatus = (subtask.status === 'complete') ? 'incomplete' : 'complete';
                const dataToSend = {
                    status: newStatus
                };

                this.$http.put(`/task/${this.item.id}/subtask/${subtask.id}`, dataToSend).then((response) => {
                    this.$f7.preloader.hide();
                    Cache.removeMatching('task');
                    this.item.subtasks[index].status = newStatus;
                    // this.$f7router.back();
                    this.busy = false;
                }, (response) => {
                    this.busy = false;
                    this.$f7.preloader.hide();
                    this.$f7.dialog.alert(response.data.error.message);
                });
            },

            remove(subtask) {
                this.$f7.preloader.show();
                this.$http.delete(`/task/${this.item.id}/subtask/${subtask.id}`).then((response) => {
                    this.removeFromList(subtask);
                    this.$f7.preloader.hide();
                    Cache.removeMatching('task');
                }, () => {
                    this.$f7.preloader.hide();
                });
            },
            removeFromList(subtask) {
                const index = this.item.subtasks.indexOf(subtask);
                this.item.subtasks.splice(index, 1)
            }
        }
    }
</script>

<style scoped>

</style>
