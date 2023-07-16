<script type="ts">
    export let ts: string
    $: datePart = ts?.substring(0, 10);
    $: timePart = ts?.substring(11, 16);
</script>

<span title="{ts}">{datePart} {timePart} UTC</span>

