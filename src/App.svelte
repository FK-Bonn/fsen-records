<script lang="ts">
    import type {IData, INewPayoutRequestData} from "./Interfaces";
    import StudentBodyList from "./sections/StudentBodyList.svelte";
    import ErrorList from "./components/ErrorList.svelte";
    import {onDestroy, onMount} from "svelte";
    import {backendPrefix, refreshIntervalMilliseconds, siteTitle} from "./settings";
    import PayoutRequestStatistics from "./sections/PayoutRequestStatistics.svelte";
    import {allFsData, fsen, payoutRequestData, token} from "./stores";
    import UserMenu from "./sections/UserMenu.svelte";
    import {getAllFsData, getPayoutRequestData, getUrlParameter, manglePayoutRequestData, pojoToIData} from "./util";
    import DiffView from "./sections/DiffView.svelte";


    const loadData = () => {
        const url = fixedDate ? `/data/history/${fixedDate}-data.json` : "/data/data.json";
        fetch(url)
            .then(response => response.json(), () => {
                fetchDataError = "Fetching data failed";
            })
            .then(rawdata => {
                try {
                    const data: IData = pojoToIData(rawdata);

                    fetchedData = data;
                    fetchDataError = null;
                    $fsen = [...data.studentBodies.keys()].sort();
                } catch (err) {
                    fetchDataError = err.message;
                }
            }, reason => {
                fetchDataError = reason;
            });
    };

    const loadPayoutRequestData = () => {
        getPayoutRequestData(fixedDate)
            .then(data => {
                $payoutRequestData = data;
                payoutRequestsDataError = null;
            }, reason => {
                payoutRequestsDataError = reason;
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


    const loadAllFsData = () => {
        getAllFsData($token).then(data => $allFsData = data);
    };


    let fetchedData: IData | null = null;
    let fetchDataError: string | null = null;
    let payoutRequestsDataError: string | null = null;
    let errors: string[] = [];
    let diffview = getUrlParameter('diff') !== null;
    const fixedDate = getUrlParameter('date');

    if (!diffview) {
        const interval = setInterval(async () => {
            loadError();
            loadData();
            loadPayoutRequestData();
        }, refreshIntervalMilliseconds);

        onMount(() => {
            loadError();
            loadData();
            loadPayoutRequestData();
            loadAllFsData();
        });

        onDestroy(() => clearInterval(interval));
    }
</script>

<svelte:head>
    <title>{siteTitle}</title>
</svelte:head>

<main>
    <UserMenu/>

    {#if errors.length > 0}
        <ErrorList {errors}/>
    {/if}

    {#if fetchDataError}
        <pre>{fetchDataError}</pre>
    {/if}

    {#if payoutRequestsDataError}
        <pre>{payoutRequestsDataError}</pre>
    {/if}

    {#if !diffview}
        {#if fetchedData}
            <section class="section">
                <div class="container">
                    {#if fixedDate}
                        <div class="box has-background-grey-dark has-text-centered has-text-weight-bold has-text-white">
                            Stand von {fixedDate}
                        </div>
                    {/if}
                    <StudentBodyList data={fetchedData}/>
                </div>
            </section>
        {:else}
            <progress class="progress is-large is-info" max="100">60%</progress>
        {/if}
        {#if $payoutRequestData}
            <section class="section">
                <div class="container">
                    <PayoutRequestStatistics/>
                </div>
            </section>
        {:else}
            <progress class="progress is-large is-info" max="100">60%</progress>
        {/if}
    {:else}
        <DiffView/>
    {/if}

</main>
<footer class="footer">
    <div class="content has-text-centered">
        <p>
            <strong>{siteTitle}</strong> ist freie Software.
            <a href="{backendPrefix}/docs">API-Dokumentation</a> ·
            <a href="https://github.com/FK-Bonn/fsen-records">Frontend</a> ·
            <a href="https://github.com/FK-Bonn/fsen-records-backend">Backend</a>
        </p>
    </div>
</footer>
