<script type="ts">
    import {euroCents, scrollToHashIfPresent} from "../util";
    import {INewPayoutRequestData} from "../Interfaces";
    import {afsgPayoutRequestData, bfsgPayoutRequestData, vorankuendigungPayoutRequestData} from "../stores";
    import {onMount} from "svelte";
    import PayoutRequestsTable from "../components/PayoutRequestsTable.svelte";

    interface CountWithSum {
        count: number
        sum: number
    }

    const mangleData = (data: Map<string, Map<string, INewPayoutRequestData>>): Map<string, Map<string, CountWithSum>> => {
        if (!data) {
            return new Map();
        }
        const retval: Map<string, Map<string, CountWithSum>> = new Map<>();
        for (let [fs, semester] of data) {
            for (let [semesterkey, semesterdata] of semester) {
                if (!retval.has(semesterkey)) {
                    retval.set(semesterkey, new Map<string, number>());
                }
                const oldValue = retval.get(semesterkey).get(semesterdata.status) || {count: 0, sum: 0}
                const newValue = {count: oldValue.count + 1, sum: oldValue.sum + semesterdata.amount_cents};
                retval.get(semesterkey).set(semesterdata.status, newValue);
            }
        }
        return retval;
    }
    const mangleBfsgData = (data: Map<string, INewPayoutRequestData[]>): Map<string, Map<string, CountWithSum>> => {
        if (!data) {
            return new Map();
        }
        const retval: Map<string, Map<string, CountWithSum>> = new Map<>();
        for (let [fs, requests] of data) {
            for (let request of requests) {
                const semesterkey = request.semester;
                if (!retval.has(semesterkey)) {
                    retval.set(semesterkey, new Map<string, number>());
                }
                const oldValue = retval.get(semesterkey).get(request.status) || {count: 0, sum: 0}
                const newValue = {count: oldValue.count + 1, sum: oldValue.sum + request.amount_cents};
                retval.get(semesterkey).set(request.status, newValue);
            }
        }
        return retval;
    }
    const getHeaders = (data: Map<string, Map<string, INewPayoutRequestData>>): string[] => {
        if (!data) {
            return [];
        }
        const headers: string[] = ['GESTELLT', 'VOLLSTÄNDIG', 'ANGEWIESEN', 'ÜBERWIESEN', 'FAILED'];
        for (let [fs, semester] of data) {
            for (let [semesterkey, semesterdata] of semester) {
                if (!headers.includes(semesterdata.status)) {
                    headers.push(semesterdata.status);
                }
            }
        }
        return headers;
    }

    const getBfsgHeaders = (data: Map<string, INewPayoutRequestData[]>): string[] => {
        if (!data) {
            return [];
        }
        const headers: string[] = ['GESTELLT', 'VOLLSTÄNDIG', 'VORGESTELLT', 'ANGENOMMEN', 'ANGEWIESEN', 'ÜBERWIESEN', 'ABGELEHNT', 'FAILED'];
        for (let [fs, requests] of data) {
            for (let request of requests) {
                if (!headers.includes(request.status)) {
                    headers.push(request.status);
                }
            }
        }
        return headers;
    }

    const totalSum = (status: string) => {
        let sum = 0;
        let count = 0;
        if (semesters) {
            for (let semester of semesters.values()) {
                sum += semester.get(status)?.sum || 0;
                count += semester.get(status)?.count || 0;
            }
        }
        return {sum, count};
    }

    const totalBfsgSum = (status: string) => {
        let sum = 0;
        let count = 0;
        if (bfsgSemesters) {
            for (let semester of bfsgSemesters.values()) {
                sum += semester.get(status)?.sum || 0;
                count += semester.get(status)?.count || 0;
            }
        }
        return {sum, count};
    }

    const rowCountSum = (semester: string) => {
        let count = 0;
        if (semesters) {
            const semesterData = semesters.get(semester);
            for (let statusValues of semesterData.values()) {
                count += statusValues.count;
            }
        }
        return count;
    }

    const bfsgRowCountSum = (semester: string) => {
        let count = 0;
        if (bfsgSemesters) {
            const semesterData = bfsgSemesters.get(semester);
            for (let statusValues of semesterData.values()) {
                count += statusValues.count;
            }
        }
        return count;
    }

    const totalPayoutRequestCount = () => {
        let count = 0;
        if (semesters) {
            for (let semester of semesters.values()) {
                for (let statusValues of semester.values()) {
                    count += statusValues.count;
                }
            }
        }
        return count;
    }

    const totalBfsgPayoutRequestCount = () => {
        let count = 0;
        if (bfsgSemesters) {
            for (let semester of bfsgSemesters.values()) {
                for (let statusValues of semester.values()) {
                    count += statusValues.count;
                }
            }
        }
        return count;
    }

    const sortBfsg = (a: INewPayoutRequestData, b: INewPayoutRequestData) => {
        if (a.status > b.status) {
            return 1;
        } else if (a.status < b.status) {
            return -1;
        } else if (a.fs > b.fs) {
            return 1;
        } else if (a.fs < b.fs) {
            return -1;
        } else if (a.request_id > b.request_id) {
            return 1;
        } else if (a.request_id < b.request_id) {
            return -1;
        }
        return 0;
    }

    $: semesters = mangleData($afsgPayoutRequestData);
    $: headers = getHeaders($afsgPayoutRequestData);
    $: bfsgSemesters = mangleBfsgData($bfsgPayoutRequestData);
    $: bfsgHeaders = getBfsgHeaders($bfsgPayoutRequestData);
    $: bfsgPayoutRequests = $bfsgPayoutRequestData ? [...$bfsgPayoutRequestData.values()].reduce((accumulator, value) => accumulator.concat(value), []).sort(sortBfsg) : [];
    $: vorankuendigungPayoutRequests = $vorankuendigungPayoutRequestData ? [...$vorankuendigungPayoutRequestData.values()].reduce((accumulator, value)=>accumulator.concat(value), []).sort(sortBfsg) : [];

    onMount(() => {
        scrollToHashIfPresent();
    });
</script>

<h2 class="title is-2" id="vorankuendigunglist">
    <a href="#vorankuendigunglist">👀</a>
    Vorankündigungen-Liste
</h2>

<PayoutRequestsTable bfsgPayoutRequests="{vorankuendigungPayoutRequests}" type="vorankuendigung"/>

<h2 class="title is-2" id="bfsglist">
    <a href="#bfsglist">🐧</a>
    BFSG-Liste
</h2>

<PayoutRequestsTable {bfsgPayoutRequests} type="bfsg"/>

<h2 class="title is-2" id="finanicalstatus">
    <a href="#finanicalstatus">🤑</a>
    Antrags-Finanzübersicht
</h2>

<h3 class="title is-3">AFSG</h3>

<table class="table is-striped is-hoverable">
    <thead>
    <tr>
        <th>Semester</th>
        {#each headers as header}
            <th colspan="2">{header}</th>
        {/each}
        <th>#</th>
    </tr>
    </thead>
    <tbody>
    {#each [...semesters.keys()].sort().reverse() as semester}
        <tr>
            <th>{semester}</th>
            {#each headers as status}
                <td><span class="tag is-light">{semesters.get(semester).get(status)?.count || 0}</span></td>
                <td>{euroCents(semesters.get(semester).get(status)?.sum)}</td>
            {/each}
            <td><span class="tag is-info is-light">{rowCountSum(semester)}</span></td>
        </tr>
    {/each}
    </tbody>
    <tfoot>
    <tr>
        <th>Semester</th>
        {#each headers as header}
            <th colspan="2">{header}</th>
        {/each}
        <th>#</th>
    </tr>
    <tr>
        <th>Gesamt</th>
        {#each headers as header}
            <th><span class="tag is-light">{totalSum(header).count}</span></th>
            <th>{euroCents(totalSum(header).sum)}</th>
        {/each}
        <td><span class="tag is-info is-light">{totalPayoutRequestCount()}</span></td>
    </tr>
    </tfoot>
</table>

<h3 class="title is-3">BFSG</h3>

<table class="table is-striped is-hoverable">
    <thead>
    <tr>
        <th>Semester</th>
        {#each bfsgHeaders as header}
            <th colspan="2">{header}</th>
        {/each}
        <th>#</th>
    </tr>
    </thead>
    <tbody>
    {#each [...bfsgSemesters.keys()].sort().reverse() as semester}
        <tr>
            <th><nobr>{semester}</nobr></th>
            {#each bfsgHeaders as status}
                <td><span class="tag is-light">{bfsgSemesters.get(semester).get(status)?.count || 0}</span></td>
                <td>{euroCents(bfsgSemesters.get(semester).get(status)?.sum)}</td>
            {/each}
            <td><span class="tag is-info is-light">{bfsgRowCountSum(semester)}</span></td>
        </tr>
    {/each}
    </tbody>
    <tfoot>
    <tr>
        <th>Semester</th>
        {#each bfsgHeaders as header}
            <th colspan="2">{header}</th>
        {/each}
        <th>#</th>
    </tr>
    <tr>
        <th>Gesamt</th>
        {#each bfsgHeaders as header}
            <th><span class="tag is-light">{totalBfsgSum(header).count}</span></th>
            <th>{euroCents(totalBfsgSum(header).sum)}</th>
        {/each}
        <td><span class="tag is-info is-light">{totalBfsgPayoutRequestCount()}</span></td>
    </tr>
    </tfoot>
</table>

<style>
    .table td, .table th {
        text-align: right;
    }
</style>