<script type="ts">
    import Star from "../icons/Star.svelte";

    export let display: boolean = false;
</script>

{#if display}
    <div class="card-header-icon">
        <Star/>
    </div>
{/if}