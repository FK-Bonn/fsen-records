<script type="ts">
    import {AnnotationLevel, IAnnotatedDocument, IStudentBody} from "../Interfaces";
    import IconForLevel from "../icons/IconForLevel.svelte";
    import SingleDocumentWithoutReferences from "./SingleDocumentWithoutReferences.svelte";
    import SingleDocument from "./SingleDocument.svelte";
    import Cross from "../icons/Cross.svelte";
    import Questionmark from "../icons/Questionmark.svelte";

    export let overallLevel: AnnotationLevel;
    export let documents: IAnnotatedDocument[];
    export let title: string;
    export let proceedingsTitle: string;
    export let studentBody: IStudentBody;
</script>

<h5 class="title is-5">
    <IconForLevel level={overallLevel}/>
    {title}
</h5>
{#each documents as document}
    <SingleDocumentWithoutReferences {document} {studentBody}/>
    <ul class="prots">
        {#each document.resolvedReferences as reference}
            <li>
                <b>{proceedingsTitle}:</b><br>
                <SingleDocument document={reference} {studentBody}/>
            </li>
        {:else}
            <li>
                <b>{proceedingsTitle}:</b>
                {#if document.checked}
                    <Cross/>
                {:else}
                    <Questionmark/>
                {/if}
                ?
            </li>
        {/each}
    </ul>
{:else}
    <Cross/>
    Fehlt!
{/each}

<style>
    h5.title {
        border-bottom: 1px solid #ccc;
        border-image: linear-gradient(90deg, #ccc, #fff) 1;
        padding-bottom: .2em;
        padding-top: .3em;
        margin: 0 0 .5em 0;
    }

    ul, ul:not(:last-child) {
        margin-top: 0;
        margin-left: 0;
        list-style: none !important;
    }

    ul.prots {
        margin-left: 1em;
    }
</style>
