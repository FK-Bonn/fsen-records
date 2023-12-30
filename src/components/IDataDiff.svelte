<script type="ts">
    import type {IAnnotatedDocumentDiff, IData, IPayoutRequestDiff, IStudentBodyDiff} from "../Interfaces";
    import {INewPayoutRequestData} from "../Interfaces";
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

    const getModifiedPayoutRequests = (first: Map<string, Map<string, INewPayoutRequestData>>,
                                       second: Map<string, Map<string, INewPayoutRequestData>>): IPayoutRequestDiff[] => {
        const modifiedPayoutRequests = [];
        for (let fs of first.keys()) {
            for (let semester of first.get(fs).keys()) {
                const firstData = first.get(fs).get(semester);
                if (!second.has(fs)) {
                    modifiedPayoutRequests.push({fs, semester, oldPR: firstData, newPR: null, type: 'AFSG'});
                } else if (!second.get(fs).has(semester)) {
                    modifiedPayoutRequests.push({fs, semester, oldPR: firstData, newPR: null, type: 'AFSG'});
                } else {
                    const secondData = second.get(fs).get(semester);
                    if (!isJsonEqual(firstData, secondData)) {
                        modifiedPayoutRequests.push({fs, semester, oldPR: firstData, newPR: secondData, type: 'AFSG'});
                    }
                }
            }
        }
        for (let fs of second.keys()) {
            for (let semester of second.get(fs).keys()) {
                const secondData = second.get(fs).get(semester);
                if (!first.has(fs)) {
                    modifiedPayoutRequests.push({fs, semester, oldPR: null, newPR: secondData});
                } else if (!first.get(fs).has(semester)) {
                    modifiedPayoutRequests.push({fs, semester, oldPR: null, newPR: secondData});
                }
            }
        }
        return modifiedPayoutRequests;
    }

    const getModifiedBfsgPayoutRequests = (first: Map<string, INewPayoutRequestData[]>,
                                           second: Map<string, INewPayoutRequestData[]>): IPayoutRequestDiff[] => {
        const modifiedPayoutRequests = [];
        for (let fs of first.keys()) {
            for (let firstData of first.get(fs)) {
                if (!second.has(fs)) {
                    modifiedPayoutRequests.push({fs, semester: firstData.semester, oldPR: firstData, newPR: null,
                        type: firstData.type.toUpperCase()});
                } else if (!second.get(fs).some(value => value.request_id === firstData.request_id)) {
                    modifiedPayoutRequests.push({fs, semester: firstData.semester, oldPR: firstData, newPR: null,
                        type: firstData.type.toUpperCase()});
                } else {
                    const secondData = second.get(fs).find(value => value.request_id === firstData.request_id);
                    if (!isJsonEqual(firstData, secondData)) {
                        modifiedPayoutRequests.push({fs, semester: firstData.semester, oldPR: firstData, newPR: secondData,
                            type: firstData.type.toUpperCase()});
                    }
                }
            }
        }
        for (let fs of second.keys()) {
            for (let secondData of second.get(fs)) {
                if (!first.has(fs)) {
                    modifiedPayoutRequests.push({fs, semester: secondData.semester, oldPR: null, newPR: secondData,
                        type: secondData.type.toUpperCase()});
                } else if (!first.get(fs).some(value => value.request_id === secondData.request_id)) {
                    modifiedPayoutRequests.push({fs, semester: secondData.semester, oldPR: null, newPR: secondData,
                        type: secondData.type.toUpperCase()});
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
            modifiedBfsg: [],
            modifiedVorankuendigung: [],
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

    const getModifiedStudentBodies = (
        first: IData,
        second: IData,
        firstPayoutRequests: Map<string, Map<string, INewPayoutRequestData>>,
        secondPayoutRequests: Map<string, Map<string, INewPayoutRequestData>>,
        firstBfsg: Map<string, INewPayoutRequestData[]>,
        secondBfsg: Map<string, INewPayoutRequestData[]>,
        firstVorankuendigung: Map<string, INewPayoutRequestData[]>,
        secondVorankuendigung: Map<string, INewPayoutRequestData[]>,
    ): IStudentBodyDiff[] => {
        const diffs = [];
        const modifiedPayoutRequests = getModifiedPayoutRequests(firstPayoutRequests, secondPayoutRequests);
        const modifiedBfsg = getModifiedBfsgPayoutRequests(firstBfsg, secondBfsg);
        const modifiedVorankuendigung = getModifiedBfsgPayoutRequests(firstVorankuendigung, secondVorankuendigung);
        for (let fs of first.studentBodies.keys()) {
            const firstStudentBody = first.studentBodies.get(fs);
            const secondStudentBody = second.studentBodies.get(fs);
            const diff = emptyStudentBodyDiff(fs, firstStudentBody.name);
            if (!secondStudentBody) {
                diff.name += ' (not found)';
                diffs.push(diff);
                continue;
            }

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
            for (let item of modifiedBfsg) {
                if (item.fs === fs) {
                    diff.modifiedBfsg.push(item);
                }
            }
            for (let item of modifiedVorankuendigung) {
                if (item.fs === fs) {
                    diff.modifiedVorankuendigung.push(item);
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
    export let firstPayoutRequests: Map<string, Map<string, INewPayoutRequestData>>;
    export let secondPayoutRequests: Map<string, Map<string, INewPayoutRequestData>>;
    export let firstBfsg: Map<string, INewPayoutRequestData[]>;
    export let secondBfsg: Map<string, INewPayoutRequestData[]>;
    export let firstVorankuendigung: Map<string, INewPayoutRequestData[]>;
    export let secondVorankuendigung: Map<string, INewPayoutRequestData[]>;
    $: modifiedStudentBodies = getModifiedStudentBodies(first, second, firstPayoutRequests, secondPayoutRequests,
        firstBfsg, secondBfsg, firstVorankuendigung, secondVorankuendigung);

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
                    <td>{request.type}<br>{request.semester}</td>
                    <PayoutRequestDiff before={request.oldPR} after={request.newPR}/>
                </tr>
            {/each}
            {#each studentBody.modifiedBfsg as request}
                <tr>
                    <td>{request.type}<br>{request.semester}</td>
                    <PayoutRequestDiff before={request.oldPR} after={request.newPR}/>
                </tr>
            {/each}
            {#each studentBody.modifiedVorankuendigung as request}
                <tr>
                    <td>{request.type}<br>{request.semester}</td>
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
