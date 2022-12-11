<script type="ts">
    import type {IFsData} from "../Interfaces";

    export let data: IFsData;
</script>

<dl>
    <dt>E-Mail</dt>
    <dd><input class="input" bind:value={data.email}/></dd>
    <dt>Telefon</dt>
    <dd><input class="input" bind:value={data.phone}/></dd>
    <dt>Webseite</dt>
    <dd><input class="input" bind:value={data.website}/></dd>
    <dt>Addresse</dt>
    <dd><textarea class="textarea" bind:value={data.address}></textarea></dd>
</dl>


<style>
    dt {
        font-weight: bold;
    }

    table {
        background-color: rgba(0, 0, 0, 0);
        width: auto;
    }
</style>
