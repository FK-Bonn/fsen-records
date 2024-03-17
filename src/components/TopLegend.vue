<script setup lang="ts">

import IconCross from "@/components/icons/IconCross.vue";
import IconStar from "@/components/icons/IconStar.vue";
import IconWarning from "@/components/icons/IconWarning.vue";
import IconQuestionmark from "@/components/icons/IconQuestionmark.vue";
import IconCheckmark from "@/components/icons/IconCheckmark.vue";
</script>

<template>
  <h5 class="subtitle is-5">Legende</h5>
  <p>Die Symbole neben den einzelnen Kategorien zeigen stets die schlechteste Markierung der relevanten Dokumente und
    Informationen an.</p>
  <ul>
    <li>
      <IconCheckmark/>
      In Ordnung
    </li>
    <li>
      <IconQuestionmark/>
      Dokument / Information noch nicht geprüft
    </li>
    <li>
      <IconWarning/>
      Dokument / Information weist Probleme auf, die in Zukunft vermieden werden sollten,
      jedoch das Dokument noch nicht unbrauchbar machen bzw. Voraussetzungen noch erfüllen
    </li>
    <li>
      <IconCross/>
      Dokument / Information weist schwerwiegende Probleme auf, die das Dokument aktuell unbrauchbar machen
      bzw. dazu führen, dass Voraussetzungen nicht erfüllt sind
    </li>
    <li>
      <IconStar/>
      Dieser Antrag könnte eventuell als vollständig markiert werden
      (ggf. abhängig von noch ungeprüften Dokumenten / Informationen)
    </li>
  </ul>
</template>

<style scoped>
.subtitle.is-5 {
  margin-bottom: .2rem;
}
</style>