<script type="ts">
    import type {IFsData} from "../Interfaces";

    export let data: IFsData;
</script>

<dl>
    <dt>E-Mail</dt>
    <dd><a href="mailto:{data.email}">{data.email}</a></dd>
    <dt>Telefon</dt>
    <dd><a href="tel:{data.phone}">{data.phone}</a></dd>
    <dt>Webseite</dt>
    <dd><a href="{data.website}">{data.website}</a></dd>
    <dt>Addresse</dt>
    <dd class="address">{data.address}</dd>
</dl>


<style>
    dt {
        font-weight: bold;
    }

    dd.address {
        white-space: pre;
    }

    table {
        background-color: rgba(0, 0, 0, 0);
        width: auto;
    }
</style>
