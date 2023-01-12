<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="trans('modules.lead.createTitle')" sliding layout="dark" theme="white">

        </f7-navbar>
        <f7-block>
            <f7-card style="margin-top: 50px;">
                <f7-card-content>

                    <f7-list form @submit.prevent="false;" id="form">

                        <f7-list-input
                            :label="trans('modules.lead.clientName')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            info=""
                            autocorrect="off"
                            name="client_name"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.client.clientName'))"
                            :placeholder="trans('modules.client.clientName')"
                            :value="item.client_name"
                            @input="item.client_name = $event.target.value"
                        ></f7-list-input>

                        <f7-list-input
                            :label="trans('modules.lead.clientEmail')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            name="client_email"
                            type="email"
                            :error-message="trans('validation.required', trans('modules.client.clientEmail'))"
                            :placeholder="trans('modules.client.clientEmail')"
                            :value="item.client_email"
                            @input="item.client_email = $event.target.value"
                        ></f7-list-input>

                        <f7-list-input
                            :label="trans('modules.lead.companyName')"
                            floating-label
                            clear-button
                            name="company_name"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.client.companyName'))"
                            :placeholder="trans('modules.client.companyName')"
                            :value="item.company_name"
                            @input="item.company_name = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.lead.website')"
                            floating-label
                            clear-button
                            name="website"
                            type="text"
                            placeholder="https://domain.com"
                            :value="item.website"
                            @input="item.website = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.lead.mobile')"
                            floating-label
                            clear-button
                            name="mobile"
                            type="text"
                            :value="item.mobile"
                            @input="item.mobile = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.lead.leadSource')"
                            type="select"
                            @change="onLeadSourceChange"
                        >
                            <option value="" v-if="leadAgents.length===0">{{ trans('modules.lead.leadSource') }}</option>
                            <option v-else :value="leadSource.id" v-for="leadSource in leadSources" :key="leadSource.id">{{ leadSource.type }}</option>
                        </f7-list-input>
                        <f7-list-input
                            :label="trans('modules.lead.leadAgent')"
                            type="select"
                            @change="onLeadAgentChange"
                        >
                            <option value="" v-if="leadAgents.length===0">{{ trans('modules.tickets.chooseAgents') }}</option>
                            <option v-else :value="leadAgent.id" v-for="leadAgent in leadAgents" :key="leadAgent.id">{{ leadAgent.user.name }}</option>
                        </f7-list-input>
                        <f7-list-input
                            :label="trans('app.next_follow_up')"
                            type="select"
                            @change="onNextFollowUpChange"
                        >
                            <option :value="next_follow_up" v-for="next_follow_up in next_follow_ups" :key="next_follow_up">{{ trans('app.'+next_follow_up) }}</option>
                        </f7-list-input>

                        <f7-list-input
                            :label="trans('modules.lead.leadCategory')"
                            type="select"
                            @change="onCategoryChange"
                            :placeholder="trans('messages.pleaseSelectCategory')"
                        >
                            <option value="" v-if="categories.length===0">{{ trans('messages.pleaseSelectCategory') }}</option>
                            <option v-else :value="category.id" v-for="category in categories" :key="category.id">{{ category.category_name }}</option>
                        </f7-list-input>

                    </f7-list>
                    <br>
                    <br>
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit"
                       :disabled="!formValid">{{ trans('app.submit') }}
                    </f7-button>
                </f7-card-content>

                <f7-block class="error-block" v-if="$store.state.error && $store.state.error.code === 0">{{ trans('messages.internetConnectionError') }}
                </f7-block>
            </f7-card>
        </f7-block>
    </f7-page>
</template>

<script type="text/babel">
    import Cache from '../../assets/vue/scripts/cache';
    import CommonMixin from "../../assets/vue/mixins/common";
    import ModuleMixin from "../lead/mixin";

    export default {
        mixins: [CommonMixin, ModuleMixin],
        data() {
            return {
                item: {
                    client_name: null,
                    client_email: null,
                    next_follow_up: 'yes',
                    company_name: null,
                    website: null,
                    mobile: null,
                    category: {
                        id: null
                    },
                    lead_source: {
                        id: null
                    },
                    lead_agent: {
                        id: null
                    }
                },
                next_follow_ups: ['yes', 'no'],
                categories: [],
                leadSources: [],
                leadAgents: [],
                error: null,
                push: null,
            };
        },
        computed: {
            formValid() {
                const $$ = this.Dom7;
                return this.item.client_name && this.item.client_email;
            },
        },
        methods: {
            init () {
                this.$f7.preloader.show();

                const promises = [];
                promises.push(this.getCategories());
                promises.push(this.getLeadSource());
                promises.push(this.getLeadAgent());

                Promise.all(promises).then(() => {
                    this.item.category =  this.categories[0];
                    this.item.lead_agent =  this.leadAgents[0];
                    this.item.lead_source =  this.leadSources[0];

                    this.$f7.preloader.hide();
                }, () => {
                    this.$f7.preloader.hide();

                });
            },

            pageLoad (page) {
                this.init();
            },
            submit() {
                this.$f7.preloader.show();

                this.$http.post(`/lead`, this.item).then((response) => {
                    this.$f7.preloader.hide();
                    Cache.removeMatching('lead');
                    this.$store.commit('sendCacheInvalidate', 'lead');
                    this.$f7router.back();
                }, () => {
                    this.$f7.preloader.hide();
                });

            }
        }

    };
</script>
