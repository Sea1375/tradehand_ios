<template>
    <f7-page>
        <f7-navbar :title="`Issue #${item.id} | Files`">
            <f7-nav-right>
                <f7-link popup-close>{{ trans('app.close') }}</f7-link>
            </f7-nav-right>
        </f7-navbar>
        <f7-list media-list inset>
            <f7-list-item
                    v-for="file in item.files"
                    v-bind:key="file.id"
                    link="#"
                    :title="file.filename"
                    @click="handleClick(file)"
                    >
                <img  slot="media" :src="file.file_url" alt="" v-if="file.icon ==='images'" width="44">
                <f7-icon slot="media" :f7="formatIcon(file)" v-else></f7-icon>
            </f7-list-item>
            <f7-block v-if="item.files.length === 0" style="text-align: center;">
                {{ trans('messages.noTaskFilesFound') }}
            </f7-block>

        </f7-list>
        <f7-block >


                <f7-sheet
                        class="sub-task-actions"
                        style="height:auto; --f7-sheet-bg-color: #fff;"
                        swipe-to-close
                        backdrop
                >
                    <f7-toolbar bg-color="blue">
                        <div class="left padding-left">{{ trans('app.action') }}</div>
                        <div class="right">
                            <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
                        </div>
                    </f7-toolbar>

                    <!-- Scrollable sheet content -->
                    <f7-list>
                        <f7-list-item view=".view-main" sheet-close :title="trans('modules.tasks.markComplete')"></f7-list-item>
                        <f7-list-item view=".view-main" sheet-close :title="trans('modules.tasks.reminder')"></f7-list-item>
                        <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')"></f7-list-item>
                        <f7-list-item view=".view-main" sheet-close :title="trans('app.delete')"></f7-list-item>
                    </f7-list>
                </f7-sheet>

        </f7-block>
        <f7-photo-browser
                :photos="image"
                type="popup"
                theme="light"
                :toolbar="false"
                ref="popupimage"
        ></f7-photo-browser>
        <!-- Extended FAB Center Bottom (Red) -->
        <f7-fab position="right-bottom" slot="fixed" href="/employee/create" color="blue">
            <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
        </f7-fab>

    </f7-page>
</template>

<script>
    import CommonMixin from "../../../assets/vue/mixins/common";

    export default {
        mixins: [CommonMixin],
        data() {
            return {
                image:[],
                busy:false
            };
        },
        props: ['item'],
        name: "subtasks",
        methods:{
            formatIcon (file){
                if (file.icon === 'images') {
                    return 'photo'
                }
                return 'arrow_down_doc';
            },
            handleClick(file) {
                if(file.icon !=='images'){
                    window.open(file.file_url, '_system');
                    return true;
                }
                this.image = [file.file_url];
                setTimeout(() => {
                    this.$refs.popupimage.open();
                }, 100);
            },
        }
    }
</script>

<style scoped>

</style>
