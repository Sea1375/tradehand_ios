<template>
    <f7-popup class="new-sub-task-popup" @popup:closed="popupOpened = false" :backdrop="true" animate>
        <f7-navbar :title="`${trans('app.task')} #${item.id} | ${trans('app.new')} ${trans('modules.tasks.subTask')}`">
            <f7-nav-right>
                <f7-link popup-close=".new-sub-task-popup">{{ trans('app.close') }}</f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-block>
            <f7-list form @submit.prevent="false;" id="form" no-hairlines>

                <f7-list-input
                        :label="`${trans('app.add')} ${trans('modules.tasks.newTask')}`"
                        clear-button
                        required
                        validate-on-blur
                        autocorrect="off"
                        name="name"
                        type="text"
                        min="4"
                        :error-message="trans('validation.required', trans('modules.tasks.newTask'))"
                        :placeholder="`${trans('app.add')} ${trans('modules.tasks.newTask')}`"
                        :value="subtask.title"
                        @input="subtask.title = $event.target.value"
                ></f7-list-input>
                <f7-list-input
                        :label="trans('modules.tasks.dueDate')"
                        clear-button
                        type="datepicker"
                        readonly
                        :calendar-params="{dateFormat: getCompanyDatePickerFormat}"
                        :placeholder="trans('modules.tasks.dueDate')"
                        :value="[new Date()]"
                        @change="onDueDateChange($event.target.value)"
                ></f7-list-input>

            </f7-list>
            <br>
            <f7-button fill color="green" class="login-btn" large raised round @click="submit"
                       :disabled="!formValid">{{ trans('app.submit') }}
            </f7-button>

        </f7-block>
    </f7-popup>
</template>

<script>
    import Cache from '../../../assets/vue/scripts/cache';
    import moment from 'moment';
    import CommonMixin from "../../../assets/vue/mixins/common";
    export default {
        mixins: [CommonMixin],
        name: "subtasks",
        props: ['item'],
        data() {
            return {
                busy: false,
                subtask: {
                    title: null,
                    due_date:null
                }
            };
        },
        computed: {
            formValid() {
                const $$ = this.Dom7;
                return this.subtask.title && $$('#form')[0] && $$('#form')[0].checkValidity();
            },
        },
        methods: {
            onDueDateChange(date) {
                if (date) {
                    let momentDate = moment(date, this.getCompanyMomentDateFormat);
                    this.subtask.due_date = momentDate.format('YYYY-MM-DD');
                }
            },
            submit() {
                this.$f7.preloader.show();
                this.busy = true;

                this.$http.post(`/task/${this.item.id}/subtask`, this.subtask).then((response) => {
                    this.$f7.preloader.hide();
                    Cache.removeMatching('task');

                    this.$emit('fetch');
                    this.$f7.popup.close('.new-sub-task-popup');
                    this.busy = false;
                    // Reset Pop Update
                    this.subtask = {
                        title: null,
                        due_date: null
                    }

                }, (response) => {
                    this.busy = false;
                    this.$f7.preloader.hide();
                    this.$f7.dialog.alert(response.data.error.message);
                });
            },
        }
    }
</script>
