<script type="ts">
    import {Interval} from "../Calculator";

    export let interval: Interval;
    const options: Intl.DateTimeFormatOptions = {year: 'numeric', month: '2-digit', day: '2-digit'};
</script>

{#if interval.start.toUTCString() === interval.end.toUTCString()}
    {interval.start.toLocaleDateString('de-DE', options)}
{:else}
    {interval.start.toLocaleDateString('de-DE', options)} – {interval.end.toLocaleDateString('de-DE', options)}
{/if}