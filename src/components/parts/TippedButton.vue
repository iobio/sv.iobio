<template>
    <button class="tipped-button" :class="shape">
        <template v-if="buttonText">{{ buttonText }}</template>
        <div class="symbol" v-if="buttonSymbol" v-html="buttonSymbol"></div>
    </button>
</template>

<script>
export default {
    name: "TippedButton",
    props: {
        buttonText: {
            type: String,
            required: false,
            default: "",
        },
        buttonSymbol: {
            type: String,
            required: false,
            default: "",
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
            rootPosition: null,
        };
    },
    mounted() {
        this.root = this.$el;
        this.rootPosition = this.root.getBoundingClientRect();
        this.root.addEventListener("mouseenter", this.showTip);
        this.root.addEventListener("mouseleave", this.hideTip);

        this.tip = document.createElement("span");
        this.tip.className = `btn-tip ${this.position}`;
        this.tip.innerHTML = this.tipText;
        document.body.appendChild(this.tip);

        this.setTipPosition();
    },
    methods: {
        showTip() {
            this.rootPosition = this.root.getBoundingClientRect();
            this.tip.style.visibility = "visible";
            this.tip.style.opacity = 1;
        },
        hideTip() {
            this.tip.style.visibility = "hidden";
            this.tip.style.opacity = 0;
        },
        setTipPosition() {
            const { left: rootLeft, right: rootRight, top: rootTop, bottom: rootBottom } = this.rootPosition;
            const { width: tipWidth, height: tipHeight } = this.tip.getBoundingClientRect();

            if (this.position == "top") {
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
    },
    computed: {},
    watch: {
        rootPosition() {
            this.setTipPosition();
        },
    },
};
</script>

<style lang="sass">
.tipped-button
    position: relative
    background-color: #f0f0f0
    border-radius: 5px
    border: 1px solid #e0e0e0
    color: #333
    cursor: pointer
    margin: 4px 2px
    padding: 5px 10px
    text-align: center
    text-decoration: none
    display: flex
    align-items: center
    justify-content: center
    overflow: visible
    transition: all 0.3s
    &.circle
        border-radius: 50%
        height: 25px
        width: 25px
        padding: 0
        text-align: center
        display: flex
        align-content: center
        justify-content: center
    &.rectangle
        border-radius: 5px
    &:hover
        background-color: #e0e0e0
        color: #000
    .symbol
        display: flex
        align-items: center
        justify-content: center
        height: 25px
        width: 25px
        svg
            height: 25px
            width: 25px
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
    transition: all 0.5s
    pointer-events: none
</style>
