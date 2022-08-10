<script type="ts">
    import {fade} from 'svelte/transition';
    import {copyRichContentToClipboard, copyToClipboard} from "../util";

    const clickCallback = () => {
        copyToClipboard(copyText || text);
        const oldText = text;
        text = 'kopiert!';
        setTimeout(() => {
            text = oldText;
        }, 1000);
    }

    export let text = '';
    export let copyText = undefined;
    export let bold = false;
    export let tagClass = 'is-light';
</script>

<span class="tag {tagClass}" on:click|stopPropagation={clickCallback}>
{#key text}
    <span in:fade>
{#if bold}<b>{text}</b>{:else}{text}{/if}
    </span>
{/key}
</span>


<style>
    .tag {
        margin-bottom: 0;
    }
</style>