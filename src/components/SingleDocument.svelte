<script type="ts">
    import type {IAnnotatedDocument, IStudentBody} from "../Interfaces";
    import Questionmark from "../icons/Questionmark.svelte";
    import {Interval, VerdictCalculator} from "../Calculator";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import DateRange from "./DateRange.svelte";
    import {loggedInUser, showFilenames} from "../stores";
    import DocumentName from "./DocumentName.svelte";
    import DownloadButton from "./DownloadButton.svelte";

    export let document: IAnnotatedDocument;
    export let withReferences: boolean = true;
    export let studentBody: IStudentBody;
    let displayDownloadButton = $loggedInUser && studentBody && ($loggedInUser.admin || $loggedInUser.permissions.includes(studentBody.id));
</script>

{#if document.checked}
    <IconForLevel level={VerdictCalculator.getWorstAnnotationLevel(document.annotations)}/>
{:else}
    <Questionmark/>
{/if}
{#if $showFilenames}
    <code>{document.filename}</code>
    (
    <DateRange interval={Interval.fromStrings(document.dateStart, document.dateEnd || document.dateStart)}/>
    )
{:else}
    <DocumentName {document}/>
{/if}
{#if displayDownloadButton}
    <DownloadButton {studentBody} filename={document.filename}/>
{/if}
{#if withReferences}
    {#each document.references as reference}
        {#if reference.startsWith('https://')}
            <a href="{reference}">Link</a>
        {:else}
            <code>{reference}</code>
        {/if}
    {/each}
{/if}
{#if document.annotations.length > 0}
    <ul>
        {#each document.annotations as annotation}
            <li>
                <IconForLevel level={annotation.level}/>
                {annotation.text}
            </li>
        {/each}
    </ul>
{/if}

<style>
    ul, ul:not(:last-child) {
        list-style: none !important;
        margin-top: .2em !important;
        margin-bottom: .1em;
    }
</style>
