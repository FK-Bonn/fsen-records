<script type="ts">
    import {euroCents} from "../util";
    import type {INewPayoutRequestData} from "../Interfaces";
    import {payoutRequestData} from "../stores";

    interface SemesterSums {
        open: number
        completed: number
    }

    const mangleData = (data: Map<string, Map<string, INewPayoutRequestData>>): Map<string, SemesterSums> => {
        if (!data) {
            return new Map();
        }
        const retval: Map<string, SemesterSums> = new Map<string, SemesterSums>();
        for (let [fs, semester] of data) {
            for (let [semesterkey, semesterdata] of semester) {
                if (!retval.has(semesterkey)) {
                    retval.set(semesterkey, {open: 0, completed: 0});
                }
                const oldValue = retval.get(semesterkey) || {open: 0, completed: 0};
                let newValue = oldValue;
                if (['GESTELLT', 'VOLLSTÄNDIG'].includes(semesterdata.status)) {
                    newValue = {open: oldValue.open + semesterdata.amount_cents, completed: oldValue.completed};
                }
                if (['ANGEWIESEN', 'ÜBERWIESEN', 'FAILED'].includes(semesterdata.status)) {
                    newValue = {open: oldValue.open, completed: oldValue.completed + semesterdata.amount_cents};
                }
                retval.set(semesterkey, newValue);
            }
        }
        return retval;
    }

    const getNextFinancialYear = () => {
        const today = fixedDate ? new Date(fixedDate) : new Date();
        if (today.getMonth() > 5) {
            return `${today.getFullYear() + 1}/${(today.getFullYear() + 2).toString().substring(2)}`;
        }
        return `${(today.getFullYear())}/${(today.getFullYear() + 1).toString().substring(2)}`;
    }

    const getRequestableSemestersForNextFinancialYear = () => {
        const today = fixedDate ? new Date(fixedDate) : new Date();
        const semesters = [];
        semesters.push(`${today.getFullYear()}-SoSe`);
        semesters.push(`${today.getFullYear()}-WiSe`);
        if (today.getMonth() > 5) {
            semesters.push(`${today.getFullYear() + 1}-SoSe`);
            semesters.push(`${today.getFullYear() + 1}-WiSe`);
        } else {
            semesters.push(`${today.getFullYear() - 1}-SoSe`);
            semesters.push(`${today.getFullYear() - 1}-WiSe`);
        }
        semesters.sort().reverse();
        return semesters;
    }

    const getTransitionalSemestersForNextFinancialYear = () => {
        const today = fixedDate ? new Date(fixedDate) : new Date();
        const semesters = [];
        if (today.getMonth() > 5) {
            semesters.push(`${today.getFullYear() - 1}-SoSe`);
            semesters.push(`${today.getFullYear() - 1}-WiSe`);
        } else {
            semesters.push(`${today.getFullYear() - 2}-SoSe`);
            semesters.push(`${today.getFullYear() - 2}-WiSe`);
        }
        semesters.sort().reverse();
        return semesters;
    }

    export let fixedDate: string | null;
    $: semesters = mangleData($payoutRequestData);
    $: nextFinancialYear = getNextFinancialYear();
    $: requestableSemesters = getRequestableSemestersForNextFinancialYear();
    $: transitionalSemesters = getTransitionalSemestersForNextFinancialYear();
    $: remainingSemesters = [...semesters.keys()].filter(key => !requestableSemesters.includes(key)).sort().reverse();
    $: requestableSum = requestableSemesters.reduce((intermediateSum, semester) => intermediateSum + ((60_000 * 100) - (semesters.get(semester) || {
        open: 0,
        completed: 0
    }).completed), 0);
    $: completableSum = remainingSemesters.reduce((intermediateSum, semester) => intermediateSum + semesters.get(semester).open, 0);
</script>

<h2 class="title is-2" id="auto-budget">
    <a href="#auto-budget">💸</a>
    Haushaltsplansentwurf
</h2>

<h3 class="title is-3">HHP für nächstes Haushaltsjahr ({nextFinancialYear})</h3>

<div class="columns">
    <div class="column">
        <table class="table is-striped is-hoverable">
            <thead>
            <tr>
                <th colspan="3">Einnahmen</th>
            </tr>
            <tr>
                <th>Titel</th>
                <th>Betrag</th>
                <th>Erläuterung</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>Beiträge</td>
                <td>???</td>
                <td>Studierendenzahl WiSe * Beitrag für FSen WiSe + Studierendenzahl SoSe * Beitrag für FSen SoSe</td>
            </tr>
            <tr>
                <td>Entnahme Rücklage</td>
                <td>???</td>
                <td>Das, was zuvor in die Rücklage überführt worden war</td>
            </tr>
            <tr>
                <th>Überschuss vorheriges HHJ</th>
                <th>???</th>
                <th>Summe der Unterpunkte</th>
            </tr>
            <tr>
                <td>AFSG</td>
                <td>{euroCents(requestableSum + completableSum)}</td>
                <td>Bereits zugesprochene oder noch beantragbare AFSG</td>
            </tr>
            <tr>
                <td>BFSG</td>
                <td>???</td>
                <td>Bereits zugesprochene, aber noch nicht überwiesene BFSG</td>
            </tr>
            <tr>
                <td>Sonstige</td>
                <td>???</td>
                <td>Restliches Geld aus AFSG, BFSG, AE, …</td>
            </tr>
            </tbody>
        </table>
    </div>
    <div class="column">
        <table class="table is-striped is-hoverable">
            <thead>
            <tr>
                <th colspan="3">Ausgaben</th>
            </tr>
            <tr>
                <th>Titel</th>
                <th>Betrag</th>
                <th>Erläuterung</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <th>AFSG (beantragbar)</th>
                <th>{euroCents(requestableSum)}</th>
                <th>Summe der Unterpunkte</th>
            </tr>
            {#each requestableSemesters.slice(0, 2) as semester}
                <tr>
                    <td>{semester}</td>
                    <td>{euroCents((60_000 * 100))}</td>
                    <td>60k neu</td>
                </tr>
            {/each}
            {#each requestableSemesters.slice(2, 4) as semester}
                <tr>
                    <td>{semester}</td>
                    <td>{euroCents((60_000 * 100) - (semesters.get(semester) || {
                        open: 0,
                        completed: 0
                    }).completed)}</td>
                    <td>60k abzüglich ANGEWIESEN|UEBERWIESEN|FAILED</td>
                </tr>
            {/each}
            {#each transitionalSemesters as semester}
                <tr>
                    <td>{semester}</td>
                    <td>{euroCents(0)}</td>
                    <td>Beantragter Betrag rutscht nach AFSG (vervollständigbar)</td>
                </tr>
            {/each}
            <tr>
                <th>AFSG (vervollständigbar)</th>
                <th>{euroCents(completableSum)}</th>
                <th>Summe der Unterpunkte</th>
            </tr>
            {#each remainingSemesters as semester}
                <tr>
                    <td>{semester}</td>
                    <td>{euroCents(semesters.get(semester).open)}</td>
                    <td>Betrag für dieses Semester im Zustand EINGEREICHT|GESTELLT|VOLLSTÄNDIG</td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
</div>


<style>
    .table thead th {
        text-align: center;
    }

    .table td:nth-child(2), .table th:nth-child(2) {
        text-align: right;
    }
</style>
