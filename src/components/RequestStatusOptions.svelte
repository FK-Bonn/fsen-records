<script type="ts">
    export let type: string;

</script>

{#if type === 'afsg'}
    <option value='EINGEREICHT'>EINGEREICHT</option>
    <option value='GESTELLT'>GESTELLT</option>
    <option value='VOLLSTÄNDIG'>VOLLSTÄNDIG</option>
    <option value='ANGEWIESEN'>ANGEWIESEN</option>
    <option value='ÜBERWIESEN'>ÜBERWIESEN</option>
    <option value='FAILED'>FAILED</option>
{:else if type === 'bfsg'}
    <option value='GESTELLT'>GESTELLT</option>
    <option value='VOLLSTÄNDIG'>VOLLSTÄNDIG</option>
    <option value='VORGESTELLT'>VORGESTELLT</option>
    <option value='ANGENOMMEN'>ANGENOMMEN</option>
    <option value='ABGELEHNT'>ABGELEHNT</option>
    <option value='ANGEWIESEN'>ANGEWIESEN</option>
    <option value='ÜBERWIESEN'>ÜBERWIESEN</option>
    <option value='FAILED'>FAILED</option>
{:else if type === 'vorankuendigung'}
    <option value='GESTELLT'>GESTELLT</option>
    <option value='VOLLSTÄNDIG'>VOLLSTÄNDIG</option>
    <option value='VORGESTELLT'>VORGESTELLT</option>
    <option value='ANGENOMMEN'>ANGENOMMEN</option>
    <option value='ABGELEHNT'>ABGELEHNT</option>
    <option value='GENUTZT'>GENUTZT</option>
    <option value='FAILED'>FAILED</option>

{:else}
    ???
{/if}