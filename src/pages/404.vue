<template>
  <f7-page>
    <f7-navbar title="Not found" back-link="Back"></f7-navbar>
    <f7-block strong>
      <p>{{ trans('app.sorry') }}</p>
      <p>{{ trans('messages.mobile.requestedContentNotFound') }}</p>
    </f7-block>
  </f7-page>
</template>
<script>
  import CommonMixin from "../assets/vue/mixins/common";

  export default {
      mixins: [CommonMixin],
  };
</script>