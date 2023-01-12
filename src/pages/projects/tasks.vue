<template>
  <f7-page infinite @infinite="onInfiniteScroll" ptr @ptr:refresh="refresh"
           :infinite-preloader="infiniteScrollInProgress" @page:init="pageLoad" id="task-list">
    <!-- Top Navbar -->
    <f7-navbar :sliding="false"  back-link="Back">
      <f7-nav-title v-if="items">Project Tasks</f7-nav-title>
    </f7-navbar>

    <f7-searchbar
            class="item-search"
            disable-button-text="Cancel"
            placeholder="Search..."
            :clear-button="true"
            :custom-search="true"
            @searchbar:search="onSearch"
            @searchbar:clear="onSearchClear"
    ></f7-searchbar>
    <f7-block v-if="!busy && items.length === 0" style="text-align: center;">
      No items found
    </f7-block>

    <f7-block class="search-list">
      <f7-card  v-for="item in items" v-bind:key="item.id" @click.native="show(item)">
        <f7-card-content>
          <f7-row>
            <f7-col width="80">
              <span class="project-name">{{item.heading}}</span>
            </f7-col>

            <f7-col width="20" class="text-align-right">
              <f7-link class="text-color-blue" >#{{item.id}}</f7-link>
            </f7-col>
          </f7-row>
          <f7-row class="margin-top-half">
            <f7-col class="text-color-gray" v-if="item.project" width="75">
              <f7-icon f7="layers"></f7-icon>{{item.project.project_name}}
            </f7-col>
            <f7-col class="text-align-right" width="25">
              <badge :item="item"></badge>
            </f7-col>
          </f7-row>

          <f7-row class="margin-top" >
            <f7-col width="60" v-for="user in item.users" v-if="item.users.length>0" v-bind:key="user.id">
              <img :src="user.image_url" width="25" height="25" class="lazy lazy-fade-in margin-right-half" />
            </f7-col>
            <f7-col :width="item.users.length>0?40:100" class="deadline text-align-right text-color-gray">
              <f7-icon f7="calendar"></f7-icon>
              {{ formatDueDate(item.due_date) }}
            </f7-col>
          </f7-row>
        </f7-card-content>
      </f7-card>
    </f7-block>
    <!-- FAB Right Bottom (Orange) -->

    <!-- Extended FAB Center Bottom (Red) -->
    <f7-fab position="right-bottom" slot="fixed" href="/employee/create" color="blue">
      <f7-icon ios="f7:plus" aurora="f7:plus" md="material:add"></f7-icon>
    </f7-fab>

  </f7-page>
</template>

<script type="text/babel">
  import IndexMixin from '../../assets/vue/mixins/index';
  import CommonMixin from '../../assets/vue/mixins/common';
  import ModuleMixin from '../tasks/mixin';


  export default {
    mixins: [IndexMixin, CommonMixin, ModuleMixin],
    data () {
      return {
        endpoint: 'task',
        fields: 'id,heading,due_date,status,project{id,project_name},users{id,name,image,image_url},board_column{id,column_name,slug,label_color}',
        order: "id desc",
        perPage:10
      };
    },
    created () {
      this.pageId = Math.round(Math.random() * 100);
    },
    mounted () {

    },
    methods: {
      getFilters () {
        let filters = `project_id eq ${this.$f7route.params.id}`;

        if (this.search_query !== null) {
          filters = `(heading lk "${ this.search_query }%" or id lk "${ this.search_query }%" )`;
        }
        // Remove trailing 'and' and encode for URI
        filters = encodeURIComponent(filters);

        return filters;
      },

      show (item) {
        this.$f7router.navigate(('/task/' + item.id),{
          query: {
            item: item
          },
        });
      },
    },
  };
</script>
