
<template>
    <f7-page @page:init="pageLoad">
        <f7-navbar :back-link="true" :title="trans('app.edit')+' '+trans('app.client')" sliding layout="light" theme="white" >
        </f7-navbar>
        <f7-block v-if="item">
            <f7-card>
                <f7-card-content>

                    <f7-list inset form @submit.prevent="false;" id="form">

                        <f7-list-input
                            :label="trans('modules.client.clientName')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            info=""
                            autocorrect="off"
                            name="name"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.client.clientName'))"
                            :placeholder="trans('modules.client.clientName')"
                            :value="item.client_detail.name"
                            @input="item.client_detail.name = $event.target.value"
                        ></f7-list-input>

                        <f7-list-input
                            :label="trans('modules.client.clientEmail')"
                            floating-label
                            required
                            validate-on-blur
                            clear-button
                            name="email"
                            type="email"
                            :error-message="trans('validation.required', trans('modules.client.clientEmail'))"
                            :placeholder="trans('modules.client.clientEmail')"
                            :value="item.client_detail.email"
                            @input="item.client_detail.email = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.client.password')"
                            floating-label
                            required
                            clear-button
                            validate-on-blur
                            name="password"
                            type="password"
                            :placeholder="trans('modules.client.password')"
                            :error-message="trans('messages.noSpacePlease')"
                            pattern="[^\s]+"
                            minlength="6"
                            :value="item.password"
                            @input="item.password = $event.target.value"
                        ></f7-list-input>

                        <f7-list-input
                            :label="trans('modules.client.companyName')"
                            floating-label
                            clear-button
                            name="company_name"
                            type="text"
                            :error-message="trans('validation.required', trans('modules.client.companyName'))"
                            :placeholder="trans('modules.client.companyName')"
                            :value="item.client_detail.company_name"
                            @input="item.client_detail.company_name = $event.target.value"
                        ></f7-list-input>
                        <f7-list-input
                            :label="trans('modules.client.website')"
                            floating-label
                            clear-button
                            name="website"
                            type="text"
                            placeholder="https://domain.com"
                            :value="item.client_detail.website"
                            @input="item.client_detail.website = $event.target.value"
                        ></f7-list-input>

                        <f7-list-input
                            :label="trans('modules.client.clientCategory')"
                            type="select"
                            @change="onCategoryChange"
                            :placeholder="trans('messages.pleaseSelectCategory')"
                        >
                            <option value="" v-if="categories.length===0">{{ trans('messages.pleaseSelectCategory') }}</option>
                            <option v-else :value="category.id" :selected="category.id===item.client_detail.category.id" v-for="category in categories" :key="category.id">{{ category.category_name }}</option>
                        </f7-list-input>
                        <f7-list-input
                            :label="trans('modules.client.clientSubCategory')"
                            type="select"
                            @change="onSubCategoryChange"
                            :placeholder="trans('messages.noCategoryAdded')"
                        >
                            <option value="" v-if="subCategories.length===0">{{ trans('messages.noCategoryAdded') }}</option>
                            <option v-else :value="sub_category.id" :selected="sub_category.id===item.client_detail.sub_category.id" v-for="sub_category in subCategories" :key="sub_category.id">{{ sub_category.category_name }}</option>
                        </f7-list-input>

                    </f7-list>
                    <br>
                    <br>
                    <f7-button fill color="green" class="login-btn" large raised round @click="submit" >{{ trans('app.submit') }}
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
import CommonMixin from '../../assets/vue/mixins/common';
import ModuleMixin from './mixin';

export default {
    mixins: [CommonMixin, ModuleMixin],
    data() {
        return {
            item: {
                password: null,
                client_detail: {
                    name: null,
                    email: null,
                    company_name: null,
                    website: null,
                    category: {
                        id: null
                    },
                    sub_category: {
                        id: null
                    }
                },
            },
            categories: [],
            subCategories: [],
            allSubCategories: [],
            error: null,
            push: null,
        };
    },
    computed: {
        formValid() {
            const $$ = this.Dom7;
            return this.item.name;
        },
    },
    methods: {
        init () {
            this.$f7.preloader.show();

            const promises = [];
            promises.push(this.getItem());
            promises.push(this.getCategories());
            promises.push(this.getSubCategories());
            Promise.all(promises).then(() => {
                this.subCategories = _.filter(this.allSubCategories, (item) => item.category_id === this.item.client_detail.category ? this.item.client_detail.category.id : null);

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
            const itemToSend = {
                id: this.item.id,
                password: this.item.password,
                client_detail: {
                    name: this.item.client_detail.name,
                    email: this.item.client_detail.email,
                    company_name: this.item.client_detail.company_name,
                    website: this.item.client_detail.website,
                    category: {
                        id: this.item.client_detail.category ? this.item.client_detail.category.id : null
                    },
                    sub_category: {
                        id: this.item.client_detail.sub_category ? this.item.client_detail.sub_category.id : null
                    }
                },
            };

            this.$http.put(`/client/${this.item.id}`,itemToSend).then((response) => {
                this.$f7.preloader.hide();
                Cache.removeMatching('client');
                this.$store.commit('sendCacheInvalidate', 'client');
                this.$f7router.back();
            }, () => {
                this.$f7.preloader.hide();
            });

        }
    }

};
</script>
