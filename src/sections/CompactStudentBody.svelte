<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import {CurrentlyCanBePaidCalculator, Interval, SemesterCalculator} from "../Calculator";
    import People from "../icons/People.svelte";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import {calculateSemesterId} from "../util";

    export let semesters: Interval[];
    export let studentBody: IStudentBody;
    export let fixedDate: string | null;
    $: calculator = new CurrentlyCanBePaidCalculator(studentBody, fixedDate);
</script>

<li>
    <div class="box">
        <div class="columns">
            <div class="column">
                <h2 class="title is-5" id="{studentBody.id}">
                    <a href="#{studentBody.id}">
                        <People/>
                    </a>
                    {studentBody.name}
                </h2>
            </div>
            <div class="column is-narrow">
                <IconForLevel level={calculator.calculateOverallLevel()} title="Auszahlungsfähigkeit"/>
                |
                {#each semesters as semester}
                    <IconForLevel level={new SemesterCalculator(studentBody, semester).calculateOverallLevel()}
                                  title={calculateSemesterId(semester)}/>
                {/each}
            </div>
        </div>
    </div>
</li>

<style>
    .column {
        padding: 0;
    }
</style>
