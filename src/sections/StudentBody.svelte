<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval} from "../Calculator";
    import DateRange from "../components/DateRange.svelte";
    import CurrentlyCanBePaidSection from "./CurrentlyCanBePaidSection.svelte";
    import DocumentsSection from "./DocumentsSection.svelte";
    import SemesterSection from "./SemesterSection.svelte";

    export let studentBody: IStudentBody;
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody);
    let showDocumentsList: boolean = false;

    const toggleShowDocumentsList = () => {
        showDocumentsList = !showDocumentsList;
    }
</script>

<li>
    <div class="box">
        <h2 class="title is-2" id="{studentBody.name}">
            <a href="#{studentBody.name}"><span class="icon fsicon"><i class="fas fa-users" aria-hidden="true"></i></span></a>
            {studentBody.name}
        </h2>

        <p class="box"><a href="{studentBody.statutes}">Fachschaftssatzung</a>
            · Beginn des Haushaltsjahrs: {studentBody.financialYearStart}<br/>
            Aktuelles Haushaltsjahr: <DateRange interval={calculator.getCurrentFinancialYear()}/><br/>
            Vergangenes Haushaltsjahr: <DateRange interval={calculator.getPreviousFinancialYear()}/>
        </p>

        <CurrentlyCanBePaidSection {studentBody}/>

        <SemesterSection semester={Interval.fromStrings('2021-10-01', '2022-03-31')} {studentBody}/>
        <SemesterSection semester={Interval.fromStrings('2021-04-01', '2021-09-30')} {studentBody}/>
        <SemesterSection semester={Interval.fromStrings('2020-10-01', '2021-03-31')} {studentBody}/>
        <SemesterSection semester={Interval.fromStrings('2020-04-01', '2020-09-30')} {studentBody}/>
        <SemesterSection semester={Interval.fromStrings('2019-10-01', '2020-03-31')} {studentBody}/>
        <SemesterSection semester={Interval.fromStrings('2019-04-01', '2019-09-30')} {studentBody}/>
        <SemesterSection semester={Interval.fromStrings('2018-10-01', '2019-03-31')} {studentBody}/>
        <SemesterSection semester={Interval.fromStrings('2018-04-01', '2018-09-30')} {studentBody}/>

        <DocumentsSection {studentBody}/>

    </div>
</li>

<style>
    .fsicon {
        padding-left: .8em;
        padding-right: .5em;
        vertical-align: -.15em;
    }

    .box {
        margin-bottom: 1rem;
    }
</style>