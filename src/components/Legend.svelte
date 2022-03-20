<script>
    import Checkmark from "../icons/Checkmark.svelte";
    import Questionmark from "../icons/Questionmark.svelte";
    import Warning from "../icons/Warning.svelte";
    import Cross from "../icons/Cross.svelte";
    import Star from "../icons/Star.svelte";
</script>

<h5 class="subtitle is-5">Legende</h5>
<p>Die Symbole neben den einzelnen Kategorien zeigen stets die schlechteste Markierung der relevanten Dokumente und
    Informationen an.</p>
<ul>
    <li>
        <Checkmark/>
        In Ordnung
    </li>
    <li>
        <Questionmark/>
        Dokument / Information noch nicht geprüft
    </li>
    <li>
        <Warning/>
        Dokument / Information weist Probleme auf, die in Zukunft vermieden werden sollten,
        jedoch das Dokument noch nicht unbrauchbar machen bzw. Voraussetzungen noch erfüllen
    </li>
    <li>
        <Cross/>
        Dokument / Information weist schwerwiegende Probleme auf, die das Dokument aktuell unbrauchbar machen
        bzw. dazu führen, dass Voraussetzungen nicht erfüllt sind
    </li>
    <li>
        <Star/>
        Dieser Antrag könnte eventuell als vollständig markiert werden
        (ggf. abhängig von noch ungeprüften Dokumenten / Informationen)
    </li>
</ul>

<style>
    .subtitle.is-5 {
        margin-bottom: .2rem;
    }
</style>
