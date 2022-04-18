<script type="ts">
    import type {IAnnotatedDocument, IStudentBody} from "../Interfaces";
    import SingleDocument from "./SingleDocument.svelte";

    export let document: IAnnotatedDocument;
    export let studentBody: IStudentBody;
</script>

<SingleDocument {document} {studentBody} withReferences={false}/>
