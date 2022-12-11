<script type="ts">
    import type {IEmailAddress, IProtectedFsData} from "../Interfaces";

    export let data: IProtectedFsData;

    const addEmailLine = () => {
        data.email_addresses.push({address: '', usages: []});
        data = data;
    }
    const deleteEmailLine = (address: string) => {
        for (let i = 0; i < data.email_addresses.length; i++) {
            if (data.email_addresses[i].address === address) {
                data.email_addresses.splice(i, 1);
                break;
            }
        }
        data = data;
    }
    const toggleEmailUsage = (email_address: IEmailAddress, usage: string) => {
        if (email_address.usages.includes(usage)) {
            email_address.usages.splice(email_address.usages.indexOf(usage), 1);
        } else {
            email_address.usages.push(usage);
        }
        data = data;
    }
</script>

<div class="box has-background-warning-light">
    <h4>Interne Daten</h4>
    <dl>
        <dt>IBAN</dt>
        <dd><input class="input" bind:value={data.iban}/></dd>
        <dt>BIC</dt>
        <dd><input class="input" bind:value={data.bic}/></dd>
    </dl>
    <table class="table table-sm is-bordered">
        <thead>
        <tr>
            <th></th>
            <th>E-Mail-Adresse</th>
            <th>kontakt</th>
            <th>fsl</th>
            <th>finanzen</th>
        </tr>
        </thead>
        <tbody>

        {#each data.email_addresses as email_address}
            <tr>
                <td>
                    <button class="button" on:click={()=>{deleteEmailLine(email_address.address)}}>löschen</button>
                </td>
                <td><input class="input" bind:value={email_address.address}/></td>
                {#each ['kontakt', 'fsl', 'finanzen'] as usage}
                    <td>
                        <input class="checkbox" type="checkbox" on:click={()=>toggleEmailUsage(email_address, usage)}
                               checked={email_address.usages.includes(usage) ? 'checked' : ''}/>
                    </td>
                {/each}
            </tr>
        {/each}
        <tr>
            <td colspan="5">
                <button class="button" on:click={()=>{addEmailLine()}}>Neue Zeile</button>
            </td>
        </tr>
        </tbody>
    </table>
</div>


<style>
    dt {
        font-weight: bold;
    }

    table {
        background-color: rgba(0, 0, 0, 0);
        width: auto;
    }
</style>
