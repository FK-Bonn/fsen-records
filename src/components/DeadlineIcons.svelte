<script type="ts">
    import type {Interval} from "../Calculator";
    import Calendar from "../icons/Calendar.svelte";
    import {formatDate, getLastDayForSubmission, isBeforeLastDayForSubmission, stringToDate} from "../util";
    import {completionDeadlineOverrides} from "../settings";

    const isFutureSemester = (interval: Interval): boolean => {
        const today = new Date();
        return today < interval.start;
    }


    const getLastDayForCompletion = (interval: Interval): Date => {
        for (let key in completionDeadlineOverrides) {
            if (interval.end.getTime() === stringToDate(key).getTime()) {
                return stringToDate(completionDeadlineOverrides[key]);
            }
        }
        const lastDayForCompletion = new Date(interval.end);
        lastDayForCompletion.setFullYear(lastDayForCompletion.getFullYear() + 2);
        return lastDayForCompletion;
    }

    const isBeforeLastDayForCompletion = (interval: Interval): boolean => {
        const today = new Date();
        return today < getLastDayForCompletion(interval);
    }

    const getSubmissionDeadline = (interval: Interval): string => {
        return 'Antragsfrist: ' + formatDate(getLastDayForSubmission(interval));
    }

    const getCompletionDeadline = (interval: Interval): string => {
        return 'Frist zur Vervollständigung: ' + formatDate(getLastDayForCompletion(interval));
    }

    const getColourClassForSubmission = (interval: Interval): string => {
        if (isFutureSemester(interval)) {
            return 'has-text-danger';
        }
        if (isBeforeLastDayForSubmission(interval)) {
            return 'has-text-info';
        }
        return 'has-text-secondary';
    }

    const getColourClassForCompletion = (interval: Interval): string => {
        if (isFutureSemester(interval)) {
            return 'has-text-danger';
        }
        if (isBeforeLastDayForCompletion(interval)) {
            return 'has-text-warning';
        }
        return 'has-text-secondary';
    }

    const shouldDisplay = (interval: Interval): boolean => {
        return !!interval;

    }

    export let interval: Interval;
    $: display = shouldDisplay(interval);
    $: submissionDeadline = getSubmissionDeadline(interval);
    $: completionDeadline = getCompletionDeadline(interval);
    $: submissionClass = getColourClassForSubmission(interval);
    $: completionClass = getColourClassForCompletion(interval);
</script>

{#if display}
    <span class={submissionClass}>
        <Calendar title={submissionDeadline}/>
    </span>
    <span class={completionClass}>
        <Calendar title={completionDeadline}/>
    </span>
{/if}