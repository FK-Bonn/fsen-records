<script lang="ts">
    import type {IData} from "./Interfaces";
    import StudentBodyList from "./sections/StudentBodyList.svelte";
    import ErrorList from "./components/ErrorList.svelte";
    import {onDestroy, onMount} from "svelte";
    import {backendPrefix, refreshIntervalMilliseconds, siteTitle} from "./settings";
    import PayoutRequestStatistics from "./sections/PayoutRequestStatistics.svelte";
    import {fsen} from "./stores";
    import UserMenu from "./sections/UserMenu.svelte";
    import {getUrlParameter, pojoToIData} from "./util";
    import DiffView from "./sections/DiffView.svelte";


    const loadData = () => {
        fetch("/data/data.json")
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
    let diffview = getUrlParameter('diff') !== null;

    if (!diffview) {
        const interval = setInterval(async () => {
            loadError();
            loadData();
        }, refreshIntervalMilliseconds);

        onMount(() => {
            loadError();
            loadData();
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

    {#if !diffview}
        {#if fetchedData}
            <section class="section">
                <div class="container">
                    <StudentBodyList data={fetchedData}/>
                </div>
            </section>
            <section class="section">
                <div class="container">
                    <PayoutRequestStatistics data={fetchedData}/>
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
