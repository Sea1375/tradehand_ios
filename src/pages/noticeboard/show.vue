<template>
  <f7-page @page:init="pageLoad">
    <f7-navbar :back-link="true" :title="trans('modules.notices.notice')" sliding layout="dark" theme="white">
    </f7-navbar>
    <f7-card id="employee-details" v-if="item">
      <f7-card-content>
        <f7-row>

          <f7-col width="100">
            <strong>{{item.heading}}</strong>
            <br>
            <p>{{formatCreatedDate(item)}}</p>

            <p v-html="item.description"></p>
          </f7-col>
        </f7-row>

      </f7-card-content>
    </f7-card>

    <f7-block v-if="item">&nbsp;</f7-block>
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
        endpoint: '/notice',
        item: null,
        busy: false,
      };
    },
    mounted () {
      console.log(this.item);
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
        this.$f7router.navigate('/notice/' + item.id + '/edit',{
          params: {
            item: item
          }
        });
      },

      remove () {

        this.$f7.dialog.confirm(`${this.trans('messages.confirmation.noticeDelete')}`, '', () => {
          this.$f7.sheet.close();
          this.$f7.preloader.show();

          this.$http.delete(`/notice/${ this.item.id }`).then(() => {
            this.$f7.preloader.hide();
            Cache.removeMatching('notice');
            this.$store.commit('sendCacheInvalidate', 'notice');
            this.$f7router.back();
          }, (response) => {
            this.$f7.preloader.hide();
            this.$f7.dialog.alert(response.data.error.message);
          });

        });
      },
    },
  };
</script>
