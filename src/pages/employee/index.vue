<template>
  <f7-page infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh" :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad">
    <!-- Top Navbar -->
    <f7-navbar :sliding="false" >
      <f7-nav-left>
        <f7-link icon-ios="f7:menu" icon-aurora="f7:menu" icon-md="material:menu" panel-open="left"></f7-link>
      </f7-nav-left>
      <f7-nav-title >{{ trans('app.menu.employees') }}</f7-nav-title>
       <f7-nav-right>
          <f7-link href="#"  sheet-open=".filter-actions" icon-f7="slider_horizontal_3"></f7-link>
       </f7-nav-right>
    </f7-navbar>

    <f7-searchbar
            class="item-search"
            :disable-button-text="trans('app.cancel')"
            :placeholder="trans('app.search')"
            :clear-button="true"
            :custom-search="true"
            @searchbar:search="onSearch"
            @searchbar:clear="onSearchClear"
    ></f7-searchbar>
    <f7-block v-if="!busy && items.length === 0" style="text-align: center;">
        {{ trans('messages.noEmployeesFound') }}
    </f7-block>


    <f7-list media-list inset id="employee-list" class="search-list searchbar-found">
      <f7-list-item
              swipeout
              badge=" "
              v-for="item in items"
              v-bind:key="item.id"
              link="#"
              :title="item.name"
              :footer="item.email"
              :badge-color="formatStatusColor(item)"
              @click="show(item)"
      >
        <img
                slot="media"
                :src="item.image_url"
                width="44"
                height="44"
                class="lazy lazy-fade-in"
        />
      </f7-list-item>

    </f7-list>
    <!-- FAB Right Bottom (Orange) -->
     <f7-sheet
         class="filter-actions"
         style="height:auto; --f7-sheet-bg-color: #fff;"
         swipe-to-close
         backdrop>
        <f7-toolbar bg-color="blue">
           <div class="left padding-left">{{ trans('app.filterResults') }}</div>
           <div class="right">
              <f7-link sheet-close>{{ trans('app.close') }}</f7-link>
           </div>
        </f7-toolbar>

        <!-- Scrollable sheet content -->
        <f7-list>
           <f7-list-item view=".view-main" sheet-close :title="formatSheetStatus(state)"
                 :id="(state === selectedFilter)? `selected` : ``"
                 :key="index"
                 @click="changeStatus(state)" v-for="(state,index) in status">

              <f7-badge :color="formatSheetStatusColor(state)"></f7-badge>
           </f7-list-item>
        </f7-list>
     </f7-sheet>
    <!-- Extended FAB Center Bottom (Red) -->
    <f7-fab position="right-bottom" slot="fixed" href="/employee/create" color="blue">
      <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
    </f7-fab>

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
        endpoint: 'employee',
        fields: 'id,name,email,status,image,image_url,employeeDetail{id,employee_id}',
        order: "users.id desc",
         status: ['all', 'active', 'deactive'],
         selectedFilter: 'active',
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
          filters = `users.name lk "%${this.search_query}%" and `;
        }
         if (this.selectedFilter !== 'all') {
            filters += `status eq "${this.selectedFilter}" and `;
         }
        // Remove trailing 'and' and encode for URI
         filters = encodeURIComponent(filters.substring(0, filters.length - 4));

        return filters;
      },

      formatData (item) {
        return `${this.capitalize(item.name)} <span class="color-gray">(${this.capitalize(item.name)})</span>`;
      },
      remove (item) {

        this.$f7.dialog.confirm(`${this.trans('messages.confirmation.employeeDelete')}`, '', () => {
          this.$f7.sheet.close();
          this.$f7.preloader.show();

          this.$http.delete(`/employee/${ item.id }`).then(() => {
            this.$f7.preloader.hide();
            Cache.removeMatching('employee');
            this.$store.commit('sendCacheInvalidate', 'employee');
            this.$f7router.refreshPage();
          }, (response) => {
            this.$f7.preloader.hide();
            this.$f7.dialog.alert(response.data.error.message);
          });

        });
      },

      show(item) {
        this.$f7router.navigate(('/employee/' + item.id), {
          query: {
            item: item
          },
        });
      },
    },
  };
</script>
