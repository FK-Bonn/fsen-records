<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import {INewPayoutRequestData} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval} from "../Calculator";
    import DateRange from "../components/DateRange.svelte";
    import CurrentlyCanBePaidSection from "./CurrentlyCanBePaidSection.svelte";
    import DocumentsSection from "./DocumentsSection.svelte";
    import SemesterSection from "./SemesterSection.svelte";
    import People from "../icons/People.svelte";
    import Warning from "../icons/Warning.svelte";
    import {displayFsData, loggedInUser} from "../stores";
    import FsDataSection from "./FsDataSection.svelte";
    import {hasFsPermission} from "../util";
    import BfsgSection from "./BfsgSection.svelte";

    export let payoutRequests: Map<string, INewPayoutRequestData> | undefined;
    export let bfsgPayoutRequests: INewPayoutRequestData[] | undefined;
    export let vorankuendigungPayoutRequests: INewPayoutRequestData[] | undefined;
    export let budgetTitles: { [semester: string]: string };
    export let budgetTitlesBfsg: { [semester: string]: string };
    export let semesters: Interval[];
    export let studentBody: IStudentBody;
    export let fixedDate: string | null;
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody, fixedDate);
    $: showData = $displayFsData && $loggedInUser && studentBody &&
        ($loggedInUser.admin || hasFsPermission($loggedInUser.permissions, studentBody.id, 'read_public_data')
            || hasFsPermission($loggedInUser.permissions, studentBody.id, 'read_protected_data'));
</script>

<li>
    <div class="box">
        <h2 class="title is-2" id="{studentBody.id}">
            <a href="#{studentBody.id}">
                <People/>
            </a>
            {studentBody.name}
        </h2>

        <div class="box">
            {#if studentBody.statutes.startsWith('https://')}
                <a href="{studentBody.statutes}">Fachschaftssatzung</a> ·
            {:else}
                <span class="has-text-danger">{studentBody.statutes}</span><br/>
            {/if}
            Beginn des Haushaltsjahrs: {studentBody.financialYearStart}
            {#if studentBody.financialYearAnnotation}
                <span class="has-text-danger">{studentBody.financialYearAnnotation}</span>
            {/if}
            <br/>
            Aktuelles Haushaltsjahr:
            <DateRange interval={calculator.getCurrentFinancialYear()}/>
            {#if calculator.getCurrentFinancialYear().end < (fixedDate ? new Date(fixedDate) : new Date())}
                <Warning/>
            {/if}
            <br/>
            Vergangenes Haushaltsjahr:
            <DateRange interval={calculator.getPreviousFinancialYear()}/>

            {#if showData}
                <FsDataSection {studentBody}/>
            {/if}
        </div>

        <CurrentlyCanBePaidSection {studentBody} {fixedDate}/>

        {#each semesters as semester}
            <SemesterSection {semester} {studentBody} {payoutRequests} {budgetTitles}/>
        {/each}

        <BfsgSection {studentBody} {bfsgPayoutRequests} {vorankuendigungPayoutRequests} {budgetTitlesBfsg}/>

        <DocumentsSection {studentBody}/>

    </div>
</li>

<style>
    .box {
        margin-bottom: 1rem;
    }
</style>