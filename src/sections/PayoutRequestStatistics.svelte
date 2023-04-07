<script type="ts">
    import type {IData, IPayoutRequestData} from "../Interfaces";
    import {euro} from "../util";

    const mangleData = (data: Map<string, Map<string, IPayoutRequestData>>): Map<string, Map<string, number>> => {
        const retval: Map<string, Map<string, number>> = new Map<>();
        for (let [fs, semester] of data) {
            for (let [semesterkey, semesterdata] of semester) {
                if (!retval.has(semesterkey)) {
                    retval.set(semesterkey, new Map<string, number>());
                }
                const newValue = (retval.get(semesterkey).get(semesterdata.status) || 0) + semesterdata.amount;
                retval.get(semesterkey).set(semesterdata.status, newValue);
            }
        }
        return retval;
    }
    const getHeaders = (data: Map<string, Map<string, IPayoutRequestData>>): string[] => {
        const headers: string[] = ['GESTELLT', 'VOLLSTÄNDIG', 'ANGEWIESEN', 'ÜBERWIESEN'];
        for (let [fs, semester] of data) {
            for (let [semesterkey, semesterdata] of semester) {
                if (!headers.includes(semesterdata.status)) {
                    headers.push(semesterdata.status);
                }
            }
        }
        return headers;
    }

    const totalSum = (status: string) => {
        let value = 0;
        if (semesters) {
            for (let semester of semesters.values()) {
                value += semester.get(status) || 0;
            }
        }
        return value;
    }

    export let data: IData;
    $: semesters = mangleData(data.payoutRequests);
    $: headers = getHeaders(data.payoutRequests);
</script>

<h2 class="title is-2" id="finanicalstatus">
    <a href="#finanicalstatus">🤑</a>
    Antrags-Finanzübersicht
</h2>

<table class="table is-striped is-hoverable">
    <thead>
    <tr>
        <th>Semester</th>
        {#each headers as header}
            <th>{header}</th>
        {/each}
    </tr>
    </thead>
    <tbody>
    {#each [...semesters.keys()].sort().reverse() as semester}
        <tr>
            <th>{semester}</th>
            {#each headers as status}
                <td>{euro(semesters.get(semester).get(status))}</td>
            {/each}
        </tr>
    {/each}
    </tbody>
    <tfoot>
    <tr>
        <th>Semester</th>
        {#each headers as header}
            <th>{header}</th>
        {/each}
    </tr>
    <tr>
        <th>Gesamt</th>
        {#each headers as header}
            <th>{euro(totalSum(header))}</th>
        {/each}
    </tr>
    </tfoot>
</table>

<style>
    .table td, .table th {
        text-align: right;
    }
</style>