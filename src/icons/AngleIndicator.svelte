<script type="ts">
    export let opened: boolean;
</script>

{#if opened}
<span class="icon">
    <i class="fas fa-angle-down" aria-hidden="true"></i>
</span>
{:else}
<span class="icon">
    <i class="fas fa-angle-left" aria-hidden="true"></i>
</span>
{/if}
