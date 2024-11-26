<template>
    <div id="lower-modal" :class="{hidden: this.hidden}">
        <div class="close-button" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <title>close</title>
                <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22C17.53,22 22,17.53 22,12C22,6.47 17.53,2 12,2M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z" />
            </svg>
        </div>
    </div>
</template>
  
<script>
  export default {
  name: 'LowerModal',
  components: {
  },
  props: {
    hidden: Boolean
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    close() {
        this.$emit('close')
    }
  },
  computed: {
  },
  watch: {
  },
  }
</script>
  
<style lang="sass">
    #lower-modal
        height: 45vh
        width: 100%
        box-sizing: border-box
        position: absolute
        bottom: 5px
        right: 0
        background-color: #F8F8F8
        opacity: 0.85
        border-radius: 5px
        border: 1px solid #E0E0E0
        z-index: 1
        &.hidden
            display: none
        .close-button
            position: absolute
            height: 30px
            width: 30px
            display: flex
            justify-content: center
            align-items: center
            right: 10px
            top: 10px
            cursor: pointer
            background-color: rgba(255, 255, 255, 0.8)
            border-radius: 50%
            box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.1)
            svg
                width: 29px
                height: 29px
                fill: #666666
                &:hover
                    fill: red
            &:hover
                color: #2A65B7
</style>