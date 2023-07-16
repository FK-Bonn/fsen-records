<script type="ts">
    import type {IProtectedFsData} from "../Interfaces";

    export let data: IProtectedFsData;
</script>

<details class="box has-background-warning-light">
    <summary>Interne Daten</summary>
    <dl>
        <dt>IBAN</dt>
        <dd>{data.iban}</dd>
        <dt>BIC</dt>
        <dd>{data.bic}</dd>
    </dl>
    <table class="table table-sm is-bordered">
        <thead>
        <tr>
            <th>E-Mail-Adresse</th>
            <th>kontakt</th>
            <th>fsl</th>
            <th>finanzen</th>
        </tr>
        </thead>
        <tbody>
        {#each data.email_addresses as email_address}
            <tr>
                <th>{email_address.address}</th>
                {#each ['kontakt', 'fsl', 'finanzen'] as usage}
                    <td>{email_address.usages.includes(usage) ? '✔️' : ''}</td>
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</details>


<style>
    dt {
        font-weight: bold;
    }

    table {
        background-color: rgba(0, 0, 0, 0);
        width: auto;
    }

    summary {
        font-weight: bold;
        cursor: pointer;
    }

    details[open] > summary:first-of-type {
        margin-bottom: 1em;
    }
</style>
