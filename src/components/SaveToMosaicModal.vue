<template>
    <div id="save-mosaic-overlay" @keydown.esc.prevent="$emit('cancel')">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="save-mosaic-title">
            <div class="header">
                <h2 id="save-mosaic-title">Save Analysis to Mosaic</h2>
            </div>
            <div class="body">
                <div class="notice" role="note" aria-label="Items saved with this analysis">
                    <div class="content">
                        <div class="intro">Saved Analyses Capture -</div>
                        <div class="chip">Favorited SVs</div>
                        <div class="chip">Hidden SVs (left bar)</div>
                        <div class="chip">View mode (Genome/HPO)</div>
                        <div class="chip">Current location (Genome)</div>
                        <div class="chip">Phenotypes</div>
                        <div class="chip">Genes of interest</div>
                    </div>
                </div>
                <label>
                    <span>Title</span>
                    <input
                        type="text"
                        :value="title"
                        placeholder="Enter a title for this analysis"
                        @input="$emit('update:title', $event.target.value)" />
                </label>

                <label>
                    <span>Description</span>
                    <textarea
                        rows="4"
                        :value="description"
                        placeholder="Optional description"
                        @input="$emit('update:description', $event.target.value)"></textarea>
                </label>
            </div>
            <div class="footer">
                <button class="secondary" @click="$emit('cancel')">Cancel</button>
                <button class="primary" :disabled="!title || saving" @click="$emit('save')">
                    <span v-if="!saving">Save</span>
                    <span v-else>Saving…</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "SaveToMosaicModal",
    props: {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        saving: { type: Boolean, default: false },
    },
    emits: ["update:title", "update:description", "cancel", "save"],
};
</script>

<style lang="sass">
#save-mosaic-overlay
    position: fixed
    inset: 0
    background: rgba(0,0,0,0.35)
    display: flex
    align-items: center
    justify-content: center
    z-index: 1000

.modal
    width: min(560px, 92vw)
    background: #fff
    border-radius: 10px
    border: 1px solid #E0E0E0
    box-shadow: 0 20px 40px rgba(0,0,0,0.25)
    display: flex
    flex-direction: column

.header
    display: flex
    align-items: center
    justify-content: space-between
    padding: 12px 14px
    border-bottom: 1px solid #EFEFEF
    h2
        margin: 0
        font-size: 1.1rem
        color: #0D60C3

.icon-btn
    border: none
    background: transparent
    border-radius: 6px
    padding: 4px
    cursor: pointer
    transition: background-color .15s ease
    img
        height: 24px
        width: 24px
        display: block
    &:hover
        background: #F3F6FB

.body
    display: flex
    flex-direction: column
    gap: 12px
    padding: 14px
    .notice
        padding: 10px 12px
        border: 1px solid #DCE7FB
        background: #F7FAFF
        border-radius: 8px
        color: #2A4A7B
        font-size: .9rem
        .content
            display: flex
            column-gap: 3px
            row-gap: 1px
            flex-wrap: wrap
            width: 100%
        .intro
            font-size: .8rem
            padding: 2px 5px 2px 0px
        .chip
            color: #224A8A
            padding: 2px 3px
            border-radius: 4px
            font-size: .8rem
            width: fit-content
            text-align: center
            font-style: italic
            font-weight: 200
            background: rgba(34,74,138,0.1)
    label
        display: flex
        flex-direction: column
        gap: 6px
        span
            font-size: .9rem
            color: #555
        input, textarea
            border: 1px solid #D6DDE8
            border-radius: 6px
            padding: 8px 10px
            font-size: .95rem
            outline: none
            &:focus
                border-color: #2A65B7
                box-shadow: 0 0 0 2px rgba(42,101,183,0.12)

.footer
    display: flex
    justify-content: flex-end
    gap: 8px
    padding: 12px 14px
    border-top: 1px solid #EFEFEF
    button
        border-radius: 6px
        padding: 8px 12px
        cursor: pointer
        border: 1px solid transparent
        transition: filter .15s ease
        &:disabled
            cursor: not-allowed
            opacity: .6
        &.secondary
            background: #F3F6FB
            border-color: #D6DDE8
            color: #2A65B7
            &:hover:not(:disabled)
                filter: brightness(0.98)
        &.primary
            background: #0D60C3
            border-color: #0B4B99
            color: #fff
            &:hover:not(:disabled)
                filter: brightness(1.07)
</style>
