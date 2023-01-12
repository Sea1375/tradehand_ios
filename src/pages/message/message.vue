<template>
    <f7-page>

        <f7-messagebar
            :placeholder="placeholder"
            ref="messagebar"
        >
            <f7-link
                icon-ios="f7:arrow_up_circle_fill"
                icon-aurora="f7:arrow_up_circle_fill"
                icon-md="material:send"
                slot="inner-end"
                @click="sendMessage"
            ></f7-link>
        </f7-messagebar>

        <f7-messages ref="messages">
            <!--<f7-messages-title><b>Sunday, Feb 9,</b> 12:58</f7-messages-title>-->
            <f7-message
                v-for="(message, index) in messagesData"
                scroll-messages
                :key="index"
                :type="message.type"
                :name="message.name"
                :avatar="message.avatar"
                :first="isFirstMessage(message, index)"
                :last="isLastMessage(message, index)"
                :tail="isTailMessage(message, index)"
                :footer="message.replyDate"
            >
                <span slot="text" v-if="message.text" v-html="message.text"></span>
            </f7-message>
        </f7-messages>
    </f7-page>
</template>
<script>
import moment from "moment";
import Cache from "../../assets/vue/scripts/cache";
import CommonMixin from "../../assets/vue/mixins/common";

export default {
    mixins: [CommonMixin],
    props: ['item'],
    name: "message",
    data() {
        return {
            typingMessage: null,
            messagesData: [],
            responseInProgress: false,
        };
    },
    computed: {
        placeholder() {
            const self = this;
            return self.attachments.length > 0 ? 'Add comment or Send' : 'Message';
        },
    },
    mounted() {

        this.replyData();
        const self = this;
        self.$f7ready(() => {
            self.messagebar = self.$refs.messagebar.f7Messagebar;
            self.messages = self.$refs.messages.f7Messages;
        });
    },
    methods: {
        replyData() {
            const messagesToSend = [];
            this.item.forEach((reply) => {
                let replyDate = this.moment(reply.created_at);
                if (reply.message){
                    messagesToSend.push({
                        name: reply.from_user.name,
                        id: reply.id,
                        type: this.$store.state.user.id === reply.from_user.id ? 'sent' : 'received',
                        text: reply.message ? reply.message : null,
                        avatar: reply.from_user.image_url,
                        replyDate: replyDate.format('YYYY-MM-DD h:mm A'),
                    });
                }
            });
            this.messagesData.push(...messagesToSend);
        },
        moment (date) {
            return moment(date);
        },
        isFirstMessage(message, index) {
            const self = this;
            const previousMessage = self.messagesData[index - 1];
            if (message.isTitle) return false;
            if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name) return true;
            return false;
        },
        isLastMessage(message, index) {
            const self = this;
            const nextMessage = self.messagesData[index + 1];
            if (message.isTitle) return false;
            if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
            return false;
        },
        isTailMessage(message, index) {
            const self = this;
            const nextMessage = self.messagesData[index + 1];
            if (message.isTitle) return false;
            if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) return true;
            return false;
        },
        sendMessage() {
            let toUserId = null;
            if (this.$store.state.user.id === this.item[0].from){
                toUserId = this.item[0].to;
            } else {
                toUserId = this.item[0].from;
            }
            // this.$f7.preloader.show();
            const self = this;
            const text = self.messagebar.getValue().replace(/\n/g, '<br>').trim();
            const messagesToSend = [];
            if (text.trim().length) {
                this.$f7.preloader.show();
                messagesToSend.push({
                    text,
                    name: this.$store.state.user.name,
                    type: 'sent',
                    avatar: this.$store.state.user.image_url,
                    replyDate: moment().format('YYYY-MM-DD h:mm A'),
                });
                const itemToSend = {
                    message: text,
                    to: toUserId,
                };
    
                this.$http.post(`/userchat`,itemToSend).then((response) => {
                    this.$f7.preloader.hide();
                    Cache.removeMatching('userchat');
                    this.$store.commit('sendCacheInvalidate', 'userchat');
                }, () => {
                });
            }
            if (messagesToSend.length === 0) {
                return;
            }
            // Reset attachments
            self.attachments = [];
            // Hide sheet
            self.sheetVisible = false;
            // Clear area
            self.messagebar.clear();
            // Focus area
            if (text.length) self.messagebar.focus();
           // Send message
            self.messagesData.push(...messagesToSend);

        },
    },
};
</script>
<style>
    .message-footer{
        margin-top:4px !important;
        margin-bottom:0;
    }
</style>