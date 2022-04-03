<script type="ts">
    import type {IAnnotatedDocument} from "../Interfaces";
    import SingleDocument from "./SingleDocument.svelte";

    export let document: IAnnotatedDocument;
</script>

<SingleDocument {document} withReferences={false}/>
