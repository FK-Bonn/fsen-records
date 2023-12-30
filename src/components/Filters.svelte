<script type="ts">
    import {
        compactMode,
        displayFsData,
        paleLowerDocuments,
        showFilenames,
        showOnlySemestersWithPayoutRequests,
        showOnlySemestersWithStar,
        showOnlyWhoCurrentlyCanBePaid
    } from "../stores";
</script>

<h5 class="subtitle is-5">Filter und Einstellungen</h5>
<ul>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$showOnlyWhoCurrentlyCanBePaid}>
            Nur auszahlungsfähige Fachschaften anzeigen
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$compactMode}>
            Kompakte Ansicht
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$showOnlySemestersWithPayoutRequests} disabled={$compactMode}>
            Nur Semester mit Anträgen anzeigen
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$showOnlySemestersWithStar} disabled={$compactMode}>
            Nur Semester anzeigen, die ggf. als vollständig markiert werden können
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$showFilenames} disabled={$compactMode}>
            Dateinamen anzeigen
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$displayFsData} disabled={$compactMode}>
            FS-Kontaktdaten etc. anzeigen
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$paleLowerDocuments} disabled={$compactMode}>
            Dokumente blass anzeigen, die ein niedrigeres Level als die Oberkategorie haben
        </label>
    </li>
</ul>

<style>
    .subtitle.is-5 {
        margin-bottom: .2rem;
    }
</style>
