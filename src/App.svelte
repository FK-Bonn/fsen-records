<script lang="ts">
    import type {IData} from "./Interfaces";
    import ErrorList from "./components/ErrorList.svelte";
    import {onDestroy, onMount} from "svelte";
    import {backendPrefix, refreshIntervalMilliseconds, siteTitle} from "./settings";
    import {
        afsgPayoutRequestData,
        allFsData,
        bfsgPayoutRequestData,
        fsen,
        token,
        vorankuendigungPayoutRequestData
    } from "./stores";
    import UserMenu from "./sections/UserMenu.svelte";
    import {getAllFsData, getBfsgPayoutRequestData, getPayoutRequestData, getUrlParameter, pojoToIData} from "./util";
    import DiffView from "./sections/DiffView.svelte";
    import MainView from "./components/MainView.svelte";


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
      getPayoutRequestData('afsg', fixedDate)
        .then(data => {
          $afsgPayoutRequestData = data;
          afsgPayoutRequestsDataError = null;
        }, reason => {
          afsgPayoutRequestsDataError = reason;
        });
      getBfsgPayoutRequestData('bfsg', fixedDate)
        .then(data => {
          $bfsgPayoutRequestData = data;
          bfsgPayoutRequestsDataError = null;
        }, reason => {
          bfsgPayoutRequestsDataError = reason;
        });
      getBfsgPayoutRequestData('vorankuendigung', fixedDate)
            .then(data => {
              $vorankuendigungPayoutRequestData = data;
              vorankuendigungPayoutRequestsDataError = null;
            }, reason => {
              vorankuendigungPayoutRequestsDataError = reason;
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
    let afsgPayoutRequestsDataError: string | null = null;
    let bfsgPayoutRequestsDataError: string | null = null;
    let vorankuendigungPayoutRequestsDataError: string | null = null;
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

    {#if afsgPayoutRequestsDataError}
        <pre>{afsgPayoutRequestsDataError}</pre>
    {/if}
    {#if bfsgPayoutRequestsDataError}
        <pre>{bfsgPayoutRequestsDataError}</pre>
    {/if}
    {#if vorankuendigungPayoutRequestsDataError}
        <pre>{vorankuendigungPayoutRequestsDataError}</pre>
    {/if}

    {#if !diffview}
        <MainView {fixedDate} {fetchedData}/>
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
