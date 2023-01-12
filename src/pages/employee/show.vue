<style type="text/css">
  .badge-profile-image {
    height: 40px;
    width: 40px;
    border-radius: 50%;
  }
</style>
<template>
  <f7-page
      @page:init="pageLoad"
      @page:beforeout="onPageBeforeOut"
      @page:beforeremove="onPageBeforeRemove"
  >

    <f7-navbar :sliding="false"  back-link="Back" layout="dark" theme="white">
      <f7-nav-title sliding v-if="item">{{item.name}}</f7-nav-title>

      <f7-nav-right>
        <f7-link sheet-open=".employee-actions" icon-f7="ellipsis_vertical"></f7-link>
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
              <br/>{{formatBadgeSubtitle(item)}}
            </f7-col>
          </f7-row>
          <f7-row class="margin-top">
            <f7-col>
              <strong>{{ item.pending_task }}</strong>
              <br/>{{ trans('modules.employees.pendingTasks') }}
            </f7-col>
            <f7-col>
              <strong>{{ item.leaves_taken }}</strong>
              <br/>{{ trans('modules.employees.leavesTaken') }}
            </f7-col>
            <f7-col>
              <strong>{{ item.projects_count }}</strong>
              <br/>{{ trans('modules.module.projects') }}
            </f7-col>
          </f7-row>


        </f7-card-content>
      </f7-card>

      <f7-block-title>Profile</f7-block-title>
      <f7-list media-list class="no-margin" v-if="item">
        <f7-list-item :title="trans('modules.employees.employeeEmail')" :after="item.email"></f7-list-item>
        <f7-list-item :title="trans('modules.employees.employeeId')" :after="item.employee_detail.employee_id"></f7-list-item>
        <f7-list-item :title="trans('modules.employees.role')" :badge="capitalize(item.user_other_role)" badge-color="green"></f7-list-item>
        <f7-list-item :title="trans('modules.employees.department')"
                      :after="item.employee_detail.department?item.employee_detail.department.team_name:'-'"></f7-list-item>
        <f7-list-item :title="trans('modules.employees.designation')"
                      :after="item.employee_detail.designation?item.employee_detail.designation.name:'-'"></f7-list-item>
        <f7-list-item :title="trans('app.phone')" :after="item.mobile?item.mobile:'-'"></f7-list-item>
        <f7-list-item :title="trans('modules.employees.status')" :badge="formatStatus(item)" :badge-color="formatStatusColor(item)"></f7-list-item>

      </f7-list>

      <f7-block>&nbsp;</f7-block>

      <f7-sheet
              class="employee-actions"
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
          <f7-list-item view=".view-main" sheet-close :title="trans('app.edit')" @click.prevent="edit(item)">
            <f7-icon f7="pencil"></f7-icon>
          </f7-list-item>
          <f7-list-item view=".view-main" @click="remove" :title="trans('app.delete')">
            <f7-icon f7="trash"></f7-icon>
          </f7-list-item>
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
        endpoint: '/employee',
        item: null,
        busy: false,
      };
    },
    mounted () {
      // console.log(this.item);
    },
    methods: {
      init () {
        this.item = null;

        this.$f7.preloader.show();

        this.getItem().then(() => {
          this.$f7.preloader.hide();
        });
      },
      pageLoad (page) {
        this.init()
      },

      edit (item) {
        this.$f7router.navigate('/employee/' + item.id + '/edit',{
          params: {
            item: item
          }
        });
      },

      remove () {

        this.$f7.dialog.confirm(`${this.trans('messages.confirmation.employeeDelete')}`, '', () => {
          this.$f7.sheet.close();
          this.$f7.preloader.show();

          this.$http.delete(`/employee/${ this.item.id }`).then(() => {
            this.$f7.preloader.hide();
            Cache.removeMatching('employee');
            this.$store.commit('sendCacheInvalidate', 'employee');
            this.$f7router.back();
          }, (response) => {
            this.$f7.preloader.hide();
            this.$f7.dialog.alert(response.data.error.message);
          });

        });
      },


      formatStatus () {
          if(this.item.status === 'deactive')
              return 'Inactive'
        return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
      },

    },
  };
</script>
