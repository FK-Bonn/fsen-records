<script type="ts">
    import {
        showOnlySemestersWithPayoutRequests,
        showOnlySemestersWithStar,
        showOnlyWhoCurrentlyCanBePaid
    } from "../stores";
</script>

<h5 class="subtitle is-5">Filter</h5>
<ul>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$showOnlyWhoCurrentlyCanBePaid}>
            Nur auszahlungsfähige Fachschaften anzeigen
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$showOnlySemestersWithPayoutRequests}>
            Nur Semester mit Anträgen anzeigen
        </label>
    </li>
    <li>
        <label class="checkbox">
            <input type="checkbox" bind:checked={$showOnlySemestersWithStar}>
            Nur Semester anzeigen, die ggf. als vollständig markiert werden können
        </label>
    </li>
</ul>

<style>
    .subtitle.is-5 {
        margin-bottom: .2rem;
    }
</style>
