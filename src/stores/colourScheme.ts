import type {Ref} from 'vue'
import {ref} from 'vue'
import {defineStore} from 'pinia'

export const useColourSchemeStore = defineStore('colourScheme', () => {
    const setting: Ref<string> = ref('auto');

    const cycle = ()=>{
        if(setting.value === 'auto'){
            setting.value = 'light';
        }
        else if (setting.value === 'light') {
            setting.value = 'dark';
        } else {
            setting.value = 'auto';
        }
    }

    return {setting, cycle}
}, {persist: true})
