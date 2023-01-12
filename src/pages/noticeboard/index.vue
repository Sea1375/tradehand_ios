<template>
  <f7-page infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh" :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad">
    <!-- Top Navbar -->
    <f7-navbar :sliding="false" >
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title sliding>{{ trans('app.menu.notices') }}</f7-nav-title>
    </f7-navbar>

    <f7-searchbar
            :disable-button-text="trans('app.cancel')"
            :placeholder="trans('app.search')"
            :clear-button="true"
            :custom-search="true"
            @searchbar:search="onSearch"
            @searchbar:clear="onSearchClear"
    ></f7-searchbar>
    <f7-block v-if="!busy && items.length === 0" style="text-align: center;">
        {{ trans('messages.noNoticeFound') }}
    </f7-block>

    <f7-list media-list inset class="search-list searchbar-found">
      <f7-list-item
              v-for="item in items"
              v-bind:key="item.id"
              link="#"
              :title="item.heading"
              :subtitle="formatCreatedDate(item)"
              :text="formatDescription(item)"
              @click="show(item)"

      >
      </f7-list-item>
    </f7-list>
    <!-- Extended FAB Center Bottom (Red) -->
<!--    <f7-fab position="right-bottom" slot="fixed" href="/notice/create" color="blue">-->
<!--      <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>-->
<!--    </f7-fab>-->
  </f7-page>
</template>

<script type="text/babel">
  import IndexMixin from '../../assets/vue/mixins/index';
  import CommonMixin from '../../assets/vue/mixins/common';
  import ModuleMixin from './mixin';

  export default {
    mixins: [IndexMixin, CommonMixin, ModuleMixin],
    data () {
      return {
        endpoint: 'notice',
        fields: 'id,heading,description,to,created_at',
        order: "id desc"
      };
    },
    created () {
      this.pageId = Math.round(Math.random() * 100);
    },
    mounted () {

    },
    methods: {
      getFilters () {
        let filters = '';

        if (this.search_query !== null) {
          filters = `(heading lk "%${this.search_query}%" )`;
        }
        // Remove trailing 'and' and encode for URI
        filters = encodeURIComponent(filters);

        return filters;
      },

      formatData (item) {
        return `${this.capitalize(item.heading)} <span class="color-gray">(${this.capitalize(item.heading)})</span>`;
      },

      show (item) {
        this.$f7router.navigate(('/notice/' + item.id),{
          query: {
            item: item
          },
        });
      },
    },
  };
</script>
