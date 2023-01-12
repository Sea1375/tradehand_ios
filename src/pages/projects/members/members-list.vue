<template>
    <f7-page>
            <f7-navbar :title="trans('modules.projects.projectMembers')">
                <f7-nav-right>
                    <f7-link popup-close>Close</f7-link>
                </f7-nav-right>
            </f7-navbar>
            <member-create :item="item" v-on:fetch="$emit('fetch')"></member-create>
            <f7-list media-list inset id="employee-list" class="search-list searchbar-found">
                <f7-list-item
                        v-for="(member,index) in item.members"
                        v-bind:key="index"
                        :title="member.name"
                        :footer="member.email"
                >
                    <img
                            slot="media"
                            :src="member.image_url"
                            width="44"
                            height="44"
                            class="lazy lazy-fade-in"
                    />
                    <f7-link @click="remove(member)" class="float-right">
                        <f7-icon f7="trash_circle_fill" color="red"></f7-icon>
                    </f7-link>
                </f7-list-item>

            </f7-list>
            <f7-block v-if="item.members.length === 0" style="text-align: center;">
                {{ trans('messages.noMemberAddedToProject') }}
            </f7-block>



    </f7-page>
</template>

<script>
    import Cache from '../../../assets/vue/scripts/cache';
    import CommonMixin from '../../../assets/vue/mixins/common';
    import ModuleMixin from '../mixin';

    import MemberCreate from './create'

    export default {
        mixins: [CommonMixin, ModuleMixin],
        props: ['item'],
        name: "members",
        data() {
            return {
                busy: false,
            };
        },
        components: {
            MemberCreate
        },

        methods: {
            remove(member) {
                this.$f7.preloader.show();
                this.$http.delete(`/project/${this.item.id}/member/${member.id}`).then((response) => {
                    this.$f7.preloader.hide();
                    Cache.removeMatching('project');
                    this.$emit('fetch');
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
