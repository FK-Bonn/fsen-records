<script lang="ts">
    import type {IAnnotatedDocument, IData} from "./Interfaces";
    import StudentBodyList from "./sections/StudentBodyList.svelte";
    import ErrorList from "./components/ErrorList.svelte";
    import {onDestroy, onMount} from "svelte";
    import {refreshIntervalMilliseconds} from "./settings";

    const getProceeding = (proceedings: IAnnotatedDocument[], key: string): IAnnotatedDocument => {
        for (let proceeding of proceedings) {
            if (proceeding.filename === key) {
                return proceeding;
            }
        }
        throw new Error('No proceeding with filename "' + key + '" found.');
    }


    const loadData = () => {
        fetch("/data/data.json")
            .then(response => response.json(), () => {
                fetchDataError = "Fetching data failed";
            })
            .then(rawdata => {
                try {
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
                    fetchedData = data;
                    fetchDataError = null;
                } catch (err) {
                    fetchDataError = err.message;
                }
            }, reason => {
                fetchDataError = reason;
            });
    };

    const loadError = () => {
        fetch("/data/error.json")
            .then(response => response.json(), () => {
                errors = [];
            })
            .then(value => {
                errors = value;
            });
    };

    let fetchedData: IData | null = null;
    let fetchDataError: string | null = null;
    let errors: string[] = [];

    const interval = setInterval(async () => {
        loadError();
        loadData();
    }, refreshIntervalMilliseconds);

    onMount(() => {
        loadError();
        loadData();
    });

    onDestroy(() => clearInterval(interval));
</script>

<main>
    {#if errors.length > 0}
        <ErrorList {errors}/>
    {/if}

    {#if fetchDataError}
        <pre>{fetchDataError}</pre>
    {/if}

    {#if fetchedData}
        <section class="section">
            <div class="container">
                <StudentBodyList data={fetchedData}/>
            </div>
        </section>
    {:else}
        <progress class="progress is-large is-info" max="100">60%</progress>
    {/if}

</main>
