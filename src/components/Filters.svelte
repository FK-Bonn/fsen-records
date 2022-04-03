<script type="ts">
    import {
        compactMode,
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
            <input type="checkbox" bind:checked={$compactMode}>
            Kompakte Ansicht
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$showFilenames}>
            Dateinamen anzeigen
        </label>
    </li>
</ul>

<style>
    .subtitle.is-5 {
        margin-bottom: .2rem;
    }
</style>
