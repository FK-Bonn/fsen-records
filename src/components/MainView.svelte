<script lang="ts">

    import {afsgPayoutRequestData} from "../stores";
    import StudentBodyList from "../sections/StudentBodyList.svelte";
    import PayoutRequestStatistics from "../sections/PayoutRequestStatistics.svelte";
    import type {IData} from "../Interfaces";
    import AutoBudget from "../sections/AutoBudget.svelte";

    export let fetchedData: IData;
    export let fixedDate: string | null;
</script>

{#if fetchedData}
    <section class="section">
        <div class="container">
            {#if fixedDate}
                <div class="box has-background-grey-dark has-text-centered has-text-weight-bold has-text-white">
                    Stand von {fixedDate}
                </div>
            {/if}
            <StudentBodyList data={fetchedData} {fixedDate}/>
        </div>
    </section>
{:else}
    <progress class="progress is-large is-info" max="100">60%</progress>
{/if}
{#if $afsgPayoutRequestData}
    <section class="section">
        <div class="container">
            <PayoutRequestStatistics/>
        </div>
    </section>
    <section class="section">
        <div class="container">
            <AutoBudget {fixedDate}/>
        </div>
    </section>
{:else}
    <progress class="progress is-large is-info" max="100">60%</progress>
{/if}