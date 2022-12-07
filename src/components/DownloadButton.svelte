<script type="ts">
    import type {IStudentBody} from "../Interfaces";
    import {backendPrefix} from "../settings";
    import {token} from "../stores";

    const downloadUrl = (fs: string, filename: string) => {
        const url = backendPrefix + "/file/" + fs + "/" + filename;
        fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${$token}`}})
            .then(resp => {
                if (resp.ok) {
                    return resp.blob();
                } else {
                    return Promise.reject('An error occured');
                }
            })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            })
            .catch(() => alert('Hoppla! Das hat leider nicht geklappt'));
    }

    export let filename: string;
    export let studentBody: IStudentBody
</script>


<button class="button is-small" on:click={()=>downloadUrl(studentBody.id, filename)}>
    Öffnen
</button>