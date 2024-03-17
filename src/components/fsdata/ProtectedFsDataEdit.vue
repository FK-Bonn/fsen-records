<script setup lang="ts">

import type {IEmailAddress, IProtectedFsDataResponse} from "@/interfaces";

const data = defineModel<IProtectedFsDataResponse>({required: true})


const addEmailLine = () => {
  data.value.data.email_addresses.push({address: '', usages: []});
}
const deleteEmailLine = (address: string) => {
  for (let i = 0; i < data.value.data.email_addresses.length; i++) {
    if (data.value.data.email_addresses[i].address === address) {
      data.value.data.email_addresses.splice(i, 1);
      break;
    }
  }
}
const toggleEmailUsage = (email_address: IEmailAddress, usage: string) => {
  if (email_address.usages.includes(usage)) {
    email_address.usages.splice(email_address.usages.indexOf(usage), 1);
  } else {
    email_address.usages.push(usage);
  }
}
</script>

<template>
  <div class="box has-background-warning-light">
    <h4>Interne Daten</h4>
    <dl>
      <dt>IBAN</dt>
      <dd><input class="input" v-model="data.data.iban"/></dd>
      <dt>BIC</dt>
      <dd><input class="input" v-model="data.data.bic"/></dd>
    </dl>
    <table class="table table-sm is-bordered">
      <thead>
      <tr>
        <th></th>
        <th>E-Mail-Adresse</th>
        <th>kontakt</th>
        <th>fsl</th>
        <th>finanzen</th>
      </tr>
      </thead>
      <tbody>

      <template v-for="(emailAddress, i) in data.data.email_addresses" :key="i">
        <tr>
          <td>
            <button class="button" @click="()=>{deleteEmailLine(emailAddress.address)}">löschen</button>
          </td>
          <td><input class="input" v-model="emailAddress.address"/></td>
          <template v-for="usage in ['kontakt', 'fsl', 'finanzen']" :key="usage">
            <td>
              <input class="checkbox" type="checkbox" @click="()=>toggleEmailUsage(emailAddress, usage)"
                     :checked="emailAddress.usages.includes(usage)"/>
            </td>
          </template>
        </tr>
      </template>
      <tr>
        <td colspan="5">
          <button class="button" @click="()=>addEmailLine()">Neue Zeile</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>