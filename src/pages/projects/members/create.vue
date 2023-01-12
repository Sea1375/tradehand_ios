<template>
    <f7-block>
        <f7-list form @submit.prevent="false;" id="form" no-hairlines>

            <f7-list-item :title="trans('modules.projects.addMemberTitle')" smart-select users-select
                  class="users-select" id="user-select"
                  :smart-select-params="{openIn: 'popup', searchbar: true, searchbarPlaceholder: trans('app.search') }"
            >
                <select name="project" @change="onUserChange" multiple id="users-select">
                    <option v-if="!existingMember.includes(user.id)" :value="user.id" v-for="user in employees" :key="user.id">{{user.name}}</option>
                </select>
            </f7-list-item>
        </f7-list>
        <f7-button fill color="green" class="login-btn" large raised round @click="submit"
                   :disabled="!formValid">{{ trans('app.submit') }}
        </f7-button>

    </f7-block>
</template>

<script>
    import Cache from '../../../assets/vue/scripts/cache';
    import CommonMixin from '../../../assets/vue/mixins/common';
    import moment from 'moment';
    import ModuleMixin from '../mixin';
    export default {
        mixins: [CommonMixin, ModuleMixin],
        name: "members-create",
        props: ['item'],
        data() {
            return {
                busy: false,
                employees:[],
                members:[],
            };
        },
        computed: {
            formValid() {
                const $$ = this.Dom7;
                return this.members[0] && $$('#form')[0] && $$('#form')[0].checkValidity();
            },
            existingMember() {
                return _.map(this.item.members, (item) => item.id)
            }
        },
        mounted () {
            this.init();
        },
        methods: {
            init () {
                this.$f7.preloader.show();
                const promises = [];
                promises.push(this.getEmployees());

                Promise.all(promises).then(() => {
                    this.$f7.preloader.hide();
                }, () => {
                    this.$f7.preloader.hide();
                });
            },

            submit() {
                this.$f7.preloader.show();
                this.busy = true;
                _.each(this.item.members, (member) => {
                    this.members.push({'id':member.id})
                })
                this.$http.post(`/project/${this.item.id}/members`, {members:this.members}).then((response) => {
                    this.$f7.preloader.hide();
                    Cache.removeMatching('project');
                    this.$emit('fetch');
                    let userSmartSelect = this.$f7.smartSelect.get('#user-select  .smart-select');
                    userSmartSelect.unsetValue();

                }, (response) => {
                    this.busy = false;
                    this.$f7.preloader.hide();
                    this.$f7.dialog.alert(response.data.error.message);
                });
            },
        }
    }
</script>
