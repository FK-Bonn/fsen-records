<script setup lang="ts">


import {onBeforeMount} from "vue";
import {updatePageTitle} from "@/util";
import IconCross from "@/components/icons/IconCross.vue";

onBeforeMount(() => {
  updatePageTitle('Hilfe');
});
</script>

<template>
  <div class="container section">
    <h1 class="title is-1">Hilfe</h1>

    <p class="mb-5">Die folgenden Fragen treten gelegentlich auf und sind hier direkt mit einer Antwort versehen.</p>

    <dl>
      <dt>Wo kann ich mich vollumfassend informieren?</dt>
      <dd>Auf der <a href="https://asta-bonn.de/de/referate/fachschaftenreferat">Webseite des Fachschaftenreferats</a>.</dd>

      <dt>Kann ich AFSG-Anträge stellen, obwohl meine Fachschaft aktuell nicht auszahlungsfähig ist?</dt>
      <dd>Ja.</dd>

      <dt>Kann ich BFSG-Anträge stellen, obwohl meine Fachschaft aktuell nicht auszahlungsfähig ist?</dt>
      <dd>Ja.</dd>

      <dt>Kann ich Vorankündigungen stellen, obwohl meine Fachschaft aktuell nicht auszahlungsfähig ist?</dt>
      <dd>Ja.</dd>

      <dt>Wo kann ich Dokumente für Anträge hochladen?</dt>
      <dd>Gar nicht. Sendet die bitte per E-Mail an das
        <a href="https://asta-bonn.de/de/referate/fachschaftenreferat">Fachschaftenreferat</a>.</dd>

      <dt>Wo kann ich Sitzungsprotokolle hochladen?</dt>
      <dd>Direkt auf der <RouterLink :to="{name: 'sitzungsprotokolle'}">Sitzungsprotokolle-Seite</RouterLink>.
        Du benötigst dafür die Berechtigung "📃 Protokolle hochladen".</dd>

      <dt>Wie kann ich die Schlagwörter eines Sitzungsprotokolls ändern?</dt>
      <dd>Lade das Sitzungsprotokoll erneut hoch und gib ihm die gewünschten Schlagwörter.
        Die vorherige Version wird dann ersetzt.</dd>

      <dt>Wie kann ich ein Sitzungsprotokoll durch eine neuere Version ersetzen?</dt>
      <dd>Lade die neue Version des Sitzungsprotokolls hoch.
        Die vorherige Version wird dann ersetzt.</dd>

      <dt>Wann bekommen wir unser Geld?</dt>
      <dd>Wenn die Fachschaft auszahlungsfähig ist, der Antrag vollständig bzw. beschlossen ist
        und sonst keine Bedenken gegen die Auszahlung der Gelder bestehen,
        weist die FSK-Vorsitzende oder ihre Vertreterin die Auszahlung an.
        Meistens werden alle Auszahlungen eines Monats gesammelt angewiesen.
        Dann dauert es in der Regel noch ein paar Tage, bis die AStA-Kasse die Überweisung tätigt
        und das Geld auf eurem Konto landet.</dd>

      <dt>Wie stelle ich einen AFSG-Antrag?</dt>
      <dd>Über den "Antrag stellen"-Knopf im jeweiligen Semester-Feld deiner Fachschaft.<br>
        Damit der Knopf erscheint, musst du eingeloggt sein und die Berechtigung haben, Anträge zu stellen.</dd>

      <dt>Wie erhalte ich einen Account?</dt>
      <dd>Falls jemand aus deiner Fachschaft bereits einen Account hat,
        kann diese Person dir <RouterLink :to="{name: 'accounts-create'}">hier</RouterLink>
        einen eigenen Account erstellen.<br>
        Andernfalls schreibst du dem <a href="https://asta-bonn.de/de/referate/fachschaftenreferat">Fachschaftenreferat</a> <em>von
          eurer Fachschafts-E-Mail-Adresse</em> eine E-Mail mit deinem Namen und bittest um einen Account.</dd>

      <dt>Wo kann ich sehen, wer welche Berechtigungen für meine Fachschaft hat?</dt>
      <dd>Wenn du angemeldet bist, klickst du im Menü links
        auf <RouterLink :to="{name: 'accounts'}">Accounts</RouterLink>. Falls du die Berechtigung hast,
        Rechte für deine Fachschaft zu sehen, kannst du in der Liste der Personen sehen,
        wer welche Berechtigungen hat.</dd>

      <dt>Wo kann ich Berechtigungen ändern?</dt>
      <dd>Wenn du angemeldet bist, klickst du im Menü links
        auf <RouterLink :to="{name: 'accounts'}">Accounts</RouterLink>. Falls du die Berechtigung hast,
        Rechte für deine Fachschaft zu bearbeiten, kannst du in der Liste der Personen auf "Rechte bearbeiten"
        klicken.</dd>


      <dt>Warum wird ein <IconCross/> angezeigt, obwohl eigentlich alles passt?</dt>
      <dd>Dann passt wohl doch noch nicht alles. Falls ihr das Problem nicht selbst erkennen könnt, fragt gerne
        per E-Mail beim <a href="https://asta-bonn.de/de/referate/fachschaftenreferat">Fachschaftenreferat</a> nach.</dd>

      <dt>Was tue ich, wenn ich der Ansicht bin,
        dass eine auf dieser Webseite dargestellte Information falsch ist?</dt>
      <dd>Sende dann bitte eine E-Mail an das
        <a href="https://asta-bonn.de/de/referate/fachschaftenreferat">Fachschaftenreferat</a>, in der du dies schilderst.</dd>

    </dl>



  </div>
</template>

<style scoped>
dt {
  font-weight: bold;
}
dd {
  margin-bottom: 1rem;
}
</style>