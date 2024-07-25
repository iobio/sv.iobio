<template>
    <div id="toasts-section">
        <h3 id="toasts-title">
            Notifications & Errors
            <button @click="removeAllToasts" class="close-toasts">Clear</button>
        </h3>
        <div v-for="(toast, index) in toasts" :key="index" class="toast" :class="toast.type">
            <p>{{toast.message}}</p>
            <button @click="removeToast(index)">X</button>
        </div>
    </div>
  </template>
  
  <script>
  export default {
  name: 'ToastsSection',
  components: {
  },
  props: {
    toasts: {
        type: Array,
        default: () => []
    }
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    removeToast(index) {
        this.$emit('remove-toast', index)
    },
    removeAllToasts() {
        this.$emit('remove-all-toasts')
    }
  },
  computed: {
  },
  watch: {
  },
  }
  </script>
  
  <style lang="sass">
    #toasts-section
        width: 20vw
        position: absolute
        top: 54px
        right: -1px
        z-index: 3
        display: flex
        flex-direction: column
        justify-content: flex-start
        align-items: flex-start
        padding: 10px
        border: 1px solid #2A65B7
        border-radius: 5px 0px 0px 5px
        background-color: rgba(255, 255, 255, 0.80)
        box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5)
        #toasts-title
            display: flex
            justify-content: space-between
            align-items: center
            width: 100%
            margin-bottom: 5px
            padding: 5px
            margin: 0px
            color: #2A65B7
            .close-toasts
                background-color: #2A65B7
                color: white
                border: none
                border-radius: 5px
                padding: 5px
                cursor: pointer
                &:hover
                    background-color: #C1D1EA
        .toast
            display: flex
            justify-content: space-between
            align-items: center
            width: 100%
            padding: 5px
            margin-bottom: 3px
            border-radius: 5px
            &.info
                background-color: white
                color: #2A65B7
                border: 1px solid #2A65B7
                button
                    background-color: #2A65B7
                    color: white
                    border: none
                    border-radius: 50%
                    padding: 5px
                    cursor: pointer
                    &:hover
                        background-color: #5882C6
            &.warning
                background-color: #FFF1D6
                color: #B87A00
                border: 1px solid #B87A00
                button
                    background-color: #B87A00
                    color: white
                    border: none
                    border-radius: 50%
                    padding: 5px
                    cursor: pointer
                    &:hover
                        background-color: #FFAD0A
            &.error
                background-color: #FCEEEF
                color: #D8000C
                border: 1px solid #D8000C
                button
                    background-color: #D8000C
                    color: white
                    border: none
                    border-radius: 50%
                    padding: 5px
                    cursor: pointer
                    &:hover
                        background-color: #FF333D
            p
                margin: 0px
            button
                height: 25px
                width: 25px
                border: none
                border-radius: 50%
                padding: 5px
  </style>