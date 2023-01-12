<style type="text/css">
    .about-icon {
        width: 50%;
        margin: 0 auto;
        position: relative;
        display: block;
        margin-top: 25%;
    }
    .about-heading {
        text-align: center;
    }
</style>
<template>
    <f7-page>
        <f7-navbar :title="trans('app.about')" back-link="Back" sliding></f7-navbar>

        <img :src="$store.state.company.logo_url" class="about-icon"/>
        <h2 class="about-heading">{{$store.state.company.company_name}}</h2>
        <center>
            <p>Version {{ version }}</p>
            <p>Device ID: {{ deviceId() }}</p>
        </center>
    </f7-page>
</template>
<script type="text/babel">
    import CommonMixin from "../assets/vue/mixins/common";

    export default {
        mixins: [CommonMixin],
        data () {
            return {
                version: AppVersion.version,
            };
        },
        mounted () {
            //
        },
        methods: {
            deviceId() {
                return window.localStorage.getItem('crm_device_id');
            },
        },
    }
</script>
