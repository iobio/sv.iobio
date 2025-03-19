<template>
    <button class="tipped-button" :class="shape">
        {{ buttonText }}
        <span
            class="btn-tip"
            :class="{
                top: position == 'top',
                bottom: position == 'bottom',
                left: position == 'left',
                right: position == 'right',
            }"
            >{{ tipText }}</span
        >
    </button>
</template>

<script>
export default {
    name: "TippedButton",
    props: {
        buttonText: {
            type: String,
            required: true,
        },
        tipText: {
            type: String,
            required: true,
        },
        position: {
            type: String,
            default: "bottom",
        },
        shape: {
            type: String,
            default: "rectangle",
        },
    },
    data() {
        return {};
    },
    methods: {
        // Define your methods here
    },
    computed: {
        // Define your computed properties here
    },
    mounted() {
        // Lifecycle hook
    },
};
</script>

<style lang="sass">
.tipped-button
    background-color: #f0f0f0
    border-radius: 5px
    border: 1px solid #e0e0e0
    color: #333
    cursor: pointer
    display: inline-block
    margin: 4px 2px
    padding: 5px 10px
    position: relative
    text-align: center
    text-decoration: none
    transition: all 0.3s
    &.circle
        border-radius: 50%
        padding: 2px 5px
    &.rectangle
        border-radius: 5px
    &:hover
        background-color: #e0e0e0
        color: #000
    .btn-tip
        visibility: hidden
        white-space: nowrap
        background-color: white
        border: 1px solid #e0e0e0
        color: black
        text-align: center
        border-radius: 3px
        padding: 5px 4px
        position: absolute
        z-index: 1
        opacity: 0
        box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.3)
        transition: opacity 0.5s
        &.top
            bottom: 120%
            left: 50%
            transform: translateX(-50%)
        &.bottom
            top: 120%
            left: 50%
            transform: translateX(-50%)
        &.left
            right: 105%
            top: 50%
            transform: translateY(-50%)
        &.right
            left: 105%
            top: 50%
            transform: translateY(-50%)
    &:hover .btn-tip
        visibility: visible
        opacity: .9
</style>
