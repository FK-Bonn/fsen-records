<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import CurrentlyCanBePaidContent from "./CurrentlyCanBePaidContent.svelte";
    import AngleIndicator from "../icons/AngleIndicator.svelte";
    import DocumentsList from "./DocumentsList.svelte";

    export let studentBody: IStudentBody;
    let opened: boolean = false;

    const toggle = () => {
        opened = !opened;
    }
</script>

<div class="card">
    <header class="card-header" on:click={toggle}>
        <p class="card-header-title">
            Dokumente
        </p>
        <button class="card-header-icon" aria-label="more options">
            <AngleIndicator {opened}/>
        </button>
    </header>
    {#if opened}
        <DocumentsList {studentBody}/>
    {/if}
</div>

<style>
    .card-header {
        cursor: pointer;
    }
</style>