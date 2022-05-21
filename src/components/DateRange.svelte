<script type="ts">
    import {Interval} from "../Calculator";
    import {formatDate} from "../util";

    export let interval: Interval;
</script>

{#if interval.start.toUTCString() === interval.end.toUTCString()}
    {formatDate(interval.start)}
{:else}
    {formatDate(interval.start)} – {formatDate(interval.end)}
{/if}
