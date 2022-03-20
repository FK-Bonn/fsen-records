<script lang="ts">
    import type {IAnnotatedDocument, IData} from "./Interfaces";
    import StudentBodyList from "./sections/StudentBodyList.svelte";

    const getProceeding = (proceedings: IAnnotatedDocument[], key: string): IAnnotatedDocument => {
        for (let proceeding of proceedings) {
            if (proceeding.filename === key) {
                return proceeding;
            }
        }
        throw new Error('No proceeding with filename "' + key + '" found.');
    }


    const init = async (filename) => {
        const response = await fetch(filename);
        if (response.ok) {
            const rawdata = await response.json();
            rawdata.studentBodies = new Map(Object.entries(rawdata.studentBodies));
            rawdata.payoutRequests = new Map(Object.entries(rawdata.payoutRequests));
            for (let fsId of rawdata.payoutRequests.keys()) {
                rawdata.payoutRequests.set(fsId, new Map(Object.entries(rawdata.payoutRequests.get(fsId))));
            }
            const data: IData = rawdata as IData;
            for (let studentBody of data.studentBodies.keys()) {
                const proceedings = data.studentBodies.get(studentBody).proceedings;
                for (let budget of data.studentBodies.get(studentBody).budgets) {
                    budget.resolvedReferences = [];
                    for (let reference of budget.references) {
                        budget.resolvedReferences.push(getProceeding(proceedings, reference));
                    }
                }
                for (let balances of data.studentBodies.get(studentBody).balances) {
                    balances.resolvedReferences = [];
                    for (let reference of balances.references) {
                        balances.resolvedReferences.push(getProceeding(proceedings, reference));
                    }
                }
                for (let cashAudit of data.studentBodies.get(studentBody).cashAudits) {
                    cashAudit.resolvedReferences = [];
                    for (let reference of cashAudit.references) {
                        cashAudit.resolvedReferences.push(getProceeding(proceedings, reference));
                    }
                }
            }
            return data;
        } else {
            throw new Error("Fetching data failed");
        }
    };

    let promise: Promise<IData> = init("/data/data.json");
</script>

<main>
    {#await promise}
        <progress class="progress is-large is-info" max="100">60%</progress>
    {:then data}
        <section class="section">
            <div class="container">
                <StudentBodyList {data}/>
            </div>
        </section>
    {:catch error}
        <pre>{error.message}</pre>
    {/await}
</main>
