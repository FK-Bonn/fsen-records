<script type="ts">
    import {Interval} from "../Calculator";
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

    const getDeadline = (interval: Interval): string | null => {
        if (isBeforeLastDayForSubmission(interval)) {
            return 'Antragsfrist: ' + formatDate(getLastDayForSubmission(interval));
        }
        return 'Frist zur Vervollständigung: ' + formatDate(getLastDayForCompletion(interval));
    }

    const getColourClass = (interval: Interval): string => {
        if (isFutureSemester(interval)) {
            return 'has-text-danger';
        }
        if (isBeforeLastDayForSubmission(interval)) {
            return 'has-text-info';
        }
        if (isBeforeLastDayForCompletion(interval)) {
            return 'has-text-warning';
        }
        return 'has-text-secondary';
    }

    const shouldDisplay = (interval: Interval) => {
        if (!interval) {
            return false;
        }
        return getDeadline(interval) !== null;
    }

    export let interval: Interval;
    $: display = shouldDisplay(interval);
    $: title = getDeadline(interval);
    $: colourClass = getColourClass(interval);
</script>

{#if display}
    <span class={colourClass}>
        <Calendar {title}/>
    </span>
{/if}