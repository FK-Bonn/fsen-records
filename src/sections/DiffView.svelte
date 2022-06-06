<script type="ts">
    import {getUrlParameter, pojoToIData} from "../util";
    import {IData} from "../Interfaces";
    import IDataDiff from "../components/IDataDiff.svelte";
    import ErrorList from "../components/ErrorList.svelte";

    const loadData = (url: string): Promise<IData> => {
        return fetch(url)
            .then(response => response.json())
            .then(rawdata => pojoToIData(rawdata));
    };

    let dateStart = getUrlParameter('dateStart');
    let dateEnd = getUrlParameter('dateEnd');
    let dateEndUrl = `/data/data.json`;
    if (dateEnd) {
        dateEndUrl = `/data/history/${dateEnd}-data.json`;
    }
    let dataPromise = Promise.all([
        loadData(`/data/history/${dateStart}-data.json`),
        loadData(dateEndUrl),
    ]);
</script>

<section class="section">
    <div class="container">
        {#if !dateStart}
            Bitte gib <code>dateStart</code> an!
        {:else}
            {#await dataPromise}
                Daten werden geladen…
            {:then results}
                <IDataDiff {dateStart} {dateEnd} first={results[0]} second={results[1]}/>
            {:catch error}
                <ErrorList errors={['Die Daten konnten leider nicht geladen werden.']}/>
            {/await}
        {/if}
    </div>
</section>
