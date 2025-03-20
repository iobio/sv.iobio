<template>
    <button class="tipped-button" :class="shape">
        {{ buttonText }}
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
        return {
            root: null,
            tip: null,
        };
    },
    methods: {
        showTip() {
            this.tip.style.visibility = "visible";
            this.tip.style.opacity = 1;
        },
        hideTip() {
            this.tip.style.visibility = "hidden";
            this.tip.style.opacity = 0;
        },
    },
    computed: {},
    mounted() {
        this.root = this.$el;
        this.root.addEventListener("mouseenter", this.showTip);
        this.root.addEventListener("mouseleave", this.hideTip);

        // We will append a small "span" element to the body so that we can position it absolutely without interfering with the layout
        this.tip = document.createElement("span");
        this.tip.className = `btn-tip ${this.position}`;
        this.tip.innerHTML = this.tipText;
        document.body.appendChild(this.tip);

        const {
            left: rootLeft,
            right: rootRight,
            top: rootTop,
            bottom: rootBottom,
            height: rootHeight,
            width: rootWidth,
        } = this.root.getBoundingClientRect();

        const { width: tipWidth, height: tipHeight, left: tipLeft, right: tipRight } = this.tip.getBoundingClientRect();

        if (this.position == "top") {
            // TODO: Fix the position of the tip
            this.tip.style.left = `${rootLeft + (rootRight - rootLeft) / 2 - tipWidth / 2}px`;
            this.tip.style.bottom = `${rootTop - 5}px`;
        } else if (this.position == "bottom") {
            this.tip.style.left = `${rootLeft + (rootRight - rootLeft) / 2 - tipWidth / 2}px`;
            this.tip.style.top = `${rootBottom + 5}px`;
        } else if (this.position == "left") {
            this.tip.style.right = `${rootLeft - 5}px`;
            this.tip.style.top = `${rootTop + (rootBottom - rootTop) / 2 - tipHeight / 2}px`;
        } else if (this.position == "right") {
            this.tip.style.left = `${rootRight + 5}px`;
            this.tip.style.top = `${rootTop + (rootBottom - rootTop) / 2 - tipHeight / 2}px`;
        }
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
    text-align: center
    text-decoration: none
    overflow: visible
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
    font-size: 0.8em
    color: black
    text-align: center
    border-radius: 3px
    padding: 5px 4px
    position: absolute
    z-index: 1
    opacity: 0
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.3)
    transition: opacity 0.5s
    pointer-events: none
</style>
