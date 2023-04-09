<script type="ts">
    import type {IAnnotatedDocument} from "../../Interfaces";

    const jsonRepresentationIsDifferent = (first, second) => {
        return JSON.stringify(first) !== JSON.stringify(second);
    }

    export let before: IAnnotatedDocument | null | undefined;
    export let after: IAnnotatedDocument | null | undefined;
    let checkedChanged = true;
    let referencesChanged = true;
    let annotationsChanged = true;
    let referenceAnnotationsChanged = true;
    if (before && after) {
        checkedChanged = before.checked !== after.checked;
        referencesChanged = before.references.join(',') !== after.references.join(',');
        annotationsChanged = jsonRepresentationIsDifferent(before.annotations, after.annotations);
        referenceAnnotationsChanged = !referencesChanged && jsonRepresentationIsDifferent(before.resolvedReferences, after.resolvedReferences);
    }
</script>

<td>
    {#if before}
        <code>{before.filename}</code>
        <ul>
            {#if checkedChanged}
                <li>geprüft: {before.checked ? 'Ja' : 'Nein'}</li>
            {/if}
            {#if referencesChanged}
                <li>Referenzen:
                    <ul>
                        {#each before.references as reference}
                            <li><code>{reference}</code></li>
                        {:else}
                            <li>–</li>
                        {/each}
                    </ul>
                </li>
            {/if}
            {#if annotationsChanged}
                <li>Anmerkungen:
                    <ul>
                        {#each before.annotations as annotation}
                            <li>{annotation.level}: {annotation.text}</li>
                        {:else}
                            <li>–</li>
                        {/each}
                    </ul>
                </li>
            {/if}
            {#if before.references.length > 0 && referenceAnnotationsChanged}
                <li><span class="has-text-grey has-background-grey-lighter">
                    Anmerkungen von Referenzen wurden modifiziert
                </span></li>
            {/if}
        </ul>
    {:else }
        <span class="has-text-grey has-background-grey-lighter">(wurde neu erstellt)</span>
    {/if}
</td>
<td>
    {#if after}
        <code>{after.filename}</code>
        <ul>
            {#if checkedChanged}
                <li>geprüft: {after.checked ? 'Ja' : 'Nein'}</li>
            {/if}
            {#if referencesChanged}
                <li>Referenzen:
                    <ul>
                        {#each after.references as reference}
                            <li><code>{reference}</code></li>
                        {:else}
                            <li>–</li>
                        {/each}
                    </ul>
                </li>
            {/if}
            {#if annotationsChanged}
                <li>Anmerkungen:
                    <ul>
                        {#each after.annotations as annotation}
                            <li>{annotation.level}: {annotation.text}</li>
                        {:else}
                            <li>–</li>
                        {/each}
                    </ul>
                </li>
            {/if}
            {#if after.references.length > 0 && referenceAnnotationsChanged}
                <li><span class="has-text-grey has-background-grey-lighter">
                    Anmerkungen von Referenzen wurden modifiziert
                </span></li>
            {/if}
        </ul>
    {:else }
        <span class="has-text-grey has-background-grey-lighter">(wurde gelöscht/umbenannt)</span>
    {/if}
</td>

<style>
    td {
        width: 42.5%;
    }
</style>