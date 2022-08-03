<script type="ts">
    import type {
        IAnnotatedDocument, IAnnotatedDocumentDiff,
        IData,
        IPayoutRequestData,
        IPayoutRequestDiff,
        IStudentBodyDiff
    } from "../Interfaces";
    import People from "../icons/People.svelte";
    import {onMount} from "svelte";
    import {scrollToHashIfPresent} from "../util";
    import GenericDiff from "./diff/GenericDiff.svelte";
    import PayoutRequestDiff from "./diff/PayoutRequestDiff.svelte";
    import DocumentDiff from "./diff/DocumentDiff.svelte";

    const DOCTYPES = {
        balances: 'Haushaltsrechnung',
        budgets: 'Haushaltsplan',
        cashAudits: 'Kassenprüfung',
        electionResults: 'Wahlergebnis',
        proceedings: 'Protokoll',
    }

    const isJsonEqual = (first: any, second: any): boolean => {
        return JSON.stringify(first) === JSON.stringify(second);
    }

    const getModifiedPayoutRequests = (first: IData, second: IData): IPayoutRequestDiff[] => {
        const modifiedPayoutRequests = [];
        for (let fs of first.payoutRequests.keys()) {
            for (let semester of first.payoutRequests.get(fs).keys()) {
                const firstData = first.payoutRequests.get(fs).get(semester);
                if (!second.payoutRequests.has(fs)) {
                    modifiedPayoutRequests.push({fs, semester, oldPR: firstData, newPR: null});
                } else if (!second.payoutRequests.get(fs).has(semester)) {
                    modifiedPayoutRequests.push({fs, semester, oldPR: firstData, newPR: null});
                } else {
                    const secondData = second.payoutRequests.get(fs).get(semester);
                    if (!isJsonEqual(firstData, secondData)) {
                        modifiedPayoutRequests.push({fs, semester, oldPR: firstData, newPR: secondData});
                    }
                }
            }
        }
        for (let fs of second.payoutRequests.keys()) {
            for (let semester of second.payoutRequests.get(fs).keys()) {
                const secondData = second.payoutRequests.get(fs).get(semester);
                if (!first.payoutRequests.has(fs)) {
                    modifiedPayoutRequests.push({fs, semester, oldPR: null, newPR: secondData});
                } else if (!first.payoutRequests.get(fs).has(semester)) {
                    modifiedPayoutRequests.push({fs, semester, oldPR: null, newPR: secondData});
                }
            }
        }
        return modifiedPayoutRequests;
    }

    const emptyStudentBodyDiff = (fs: string, name: string): IStudentBodyDiff => {
        return {
            fs,
            name,
            balances: [],
            budgets: [],
            cashAudits: [],
            electionResults: [],
            proceedings: [],
            financialYearAnnotationDiff: null,
            statutesDiff: null,
            modifiedPayoutRequests: [],
        };
    }

    const annotatedDocumentComparator = (first: IAnnotatedDocumentDiff, second: IAnnotatedDocumentDiff) => {
        const firstFilename = first.oldDocument ? first.oldDocument.filename : first.newDocument.filename;
        const secondFilename = second.oldDocument ? second.oldDocument.filename : second.newDocument.filename;
        if (firstFilename > secondFilename) {
            return 1;
        } else if (firstFilename < secondFilename) {
            return -1;
        }
        return 0;
    }

    const getModifiedStudentBodies = (first: IData, second: IData): IStudentBodyDiff[] => {
        const diffs = [];
        const modifiedPayoutRequests = getModifiedPayoutRequests(first, second);
        for (let fs of first.studentBodies.keys()) {
            const firstStudentBody = first.studentBodies.get(fs);
            const secondStudentBody = second.studentBodies.get(fs);
            const diff = emptyStudentBodyDiff(fs, firstStudentBody.name);

            for (let documentType of ['balances', 'budgets', 'cashAudits', 'electionResults', 'proceedings']) {
                for (let document of firstStudentBody[documentType]) {
                    const filename = document.filename;
                    let secondDocument = secondStudentBody[documentType].find(value => value.filename === filename);
                    if (!secondDocument) {
                        diff[documentType].push({filename, oldDocument: document, newDocument: null});
                    } else if (!isJsonEqual(document, secondDocument)) {
                        diff[documentType].push({filename, oldDocument: document, newDocument: secondDocument});
                    }
                }
                for (let document of secondStudentBody[documentType]) {
                    const filename = document.filename;
                    let firstDocument = firstStudentBody[documentType].find(value => value.filename === filename);
                    if (!firstDocument) {
                        diff[documentType].push({filename, oldDocument: null, newDocument: document});
                    }
                }
                diff[documentType].sort(annotatedDocumentComparator);
            }
            for (let modifiedPayoutRequest of modifiedPayoutRequests) {
                if (modifiedPayoutRequest.fs === fs) {
                    diff.modifiedPayoutRequests.push(modifiedPayoutRequest);
                }
            }
            if (!isJsonEqual(diff, emptyStudentBodyDiff(fs, firstStudentBody.name))) {
                diffs.push(diff);
            }
        }

        return diffs;
    }

    export let dateStart: string;
    export let dateEnd: string;
    export let first: IData;
    export let second: IData;
    $: modifiedStudentBodies = getModifiedStudentBodies(first, second);

    onMount(() => {
        scrollToHashIfPresent();
    });
</script>

<div class="content">
    {#if dateEnd}
        <h2 class="title is-2">Änderungen von {dateStart} bis einschließlich {dateEnd}</h2>
    {:else}
        <h2 class="title is-2">Änderungen seit {dateStart}</h2>
    {/if}
    <h3 class="heading is-3" id="studentBodies">Fachschaften</h3>
    {#each modifiedStudentBodies as studentBody}
        <h4 class="heading is-4">
            <a id="{studentBody.fs}" href="#{studentBody.fs}">
                <People/>
            </a>
            {studentBody.name}
        </h4>
        <table class="table">
            <thead>
            <tr>
                <th>typ</th>
                <th>alt</th>
                <th>neu</th>
            </tr>
            </thead>
            <tbody>
            {#each studentBody.modifiedPayoutRequests as request}
                <tr>
                    <td>Antrag<br>{request.semester}</td>
                    <PayoutRequestDiff before={request.oldPR} after={request.newPR}/>
                </tr>
            {/each}
            {#each ['balances', 'budgets', 'cashAudits', 'electionResults', 'proceedings'] as docType}
                {#each studentBody[docType] as singleDiff}
                    <tr>
                        <td>{DOCTYPES[docType]}</td>
                        <DocumentDiff before={singleDiff.oldDocument} after={singleDiff.newDocument}/>
                    </tr>
                {/each}
            {/each}
            {#if studentBody.financialYearAnnotationDiff}
                <tr>
                    <td>Haushaltsjahr</td>
                    <GenericDiff before={studentBody.financialYearAnnotationDiff.oldString}
                                 after={studentBody.financialYearAnnotationDiff.newString}/>
                </tr>
            {/if}
            {#if studentBody.statutesDiff}
                <tr>
                    <td>Fachschaftssatzung</td>
                    <GenericDiff before={studentBody.statutesDiff.oldString}
                                 after={studentBody.statutesDiff.newString}/>
                </tr>
            {/if}
            </tbody>
        </table>
    {/each}
</div>

<style>
    td {
        width: 15%;
    }
</style>
