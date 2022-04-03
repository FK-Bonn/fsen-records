<script type="ts">
    import {fade} from 'svelte/transition';
    import {copyToClipboard} from "../util";

    const clickCallback = () => {
        copyToClipboard(text);
        const oldText = text;
        text = 'kopiert!';
        setTimeout(() => {
            text = oldText;
        }, 1000);
    }

    export let text = '';
    export let bold = false;
</script>

<span class="tag is-light" on:click|stopPropagation={clickCallback}>
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