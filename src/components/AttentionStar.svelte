<script type="ts">
    import {AnnotationLevel, IPayoutRequestData} from "../Interfaces";
    import Star from "../icons/Star.svelte";

    const shouldDisplay = (level: AnnotationLevel, payoutRequest?: IPayoutRequestData): boolean => {
        if (!payoutRequest) {
            return false;
        }
        const completeLevels: AnnotationLevel[] = [AnnotationLevel.Ok, AnnotationLevel.Unchecked];
        if (!completeLevels.includes(level)) {
            return false;
        }
        return ['GESTELLT', 'IN BEARBEITUNG'].includes(payoutRequest.status);
    }

    export let level: AnnotationLevel;
    export let payoutRequest: IPayoutRequestData;
    $: display = shouldDisplay(level, payoutRequest);
</script>

{#if display}
    <div class="card-header-icon">
        <Star/>
    </div>
{/if}