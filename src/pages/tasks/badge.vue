<template>
    <f7-badge  :style="`background-color:${item.board_column.label_color}`">{{ item.board_column.column_name }}</f7-badge>
</template>

<script>
    export default {
        props: ['item'],
        name: "badge"
    }
</script>
