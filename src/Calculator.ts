import type {IAnnotatedDocument, IAnnotation, IStudentBody} from "./Interfaces";
import {AnnotationLevel} from "./Interfaces";
import {
    getCheckedDocumentsWithoutIssues,
    getDocumentAnnotationLevel,
    getDocumentsWithoutIssues,
    getWorstAnnotationLevel,
    stringToDate
} from "./util";

export class Interval {
    start: Date
    end: Date

    constructor(start: Date, end: Date) {
        this.start = start;
        this.end = end;
    }

    static fromStrings(start: string, end: string): Interval {
        const startDate = stringToDate(start);
        const endDate = stringToDate(end);
        return new Interval(startDate, endDate);
    }

    public getOverlapping(others: IAnnotatedDocument[]): IAnnotatedDocument[] {
        const overlapping: IAnnotatedDocument[] = [];
        for (let other of others) {
            const otherStart = stringToDate(other.dateStart);
            if (!other.dateEnd) {
                if (this.start <= otherStart && this.end >= otherStart) {
                    overlapping.push(other);
                }
            } else {
                const otherEnd = stringToDate(other.dateEnd);
                if (otherStart > this.end || otherEnd < this.start) {
                    continue;
                }
                overlapping.push(other);
            }
        }
        return overlapping;
    }

    public isCoveredBy(others: IAnnotatedDocument[]): boolean {
        let remainingStart = this.start;
        const sortedOthers = [...others];
        sortedOthers.sort((a, b) => a.dateStart.localeCompare(b.dateStart))
        for (let other of sortedOthers) {
            const otherStart = stringToDate(other.dateStart);
            if (otherStart > remainingStart) {
                return false;
            }
            const otherEnd = other.dateEnd ? stringToDate(other.dateEnd) : otherStart;
            if (otherEnd > remainingStart) {
                remainingStart = otherEnd;
                remainingStart.setDate(remainingStart.getDate() + 1);
            }
            if (remainingStart > this.end) {
                return true;
            }
        }
        return false;
    }
}

export class VerdictCalculator {
    public static getWorstAnnotationLevel(annotations: IAnnotation[]): AnnotationLevel {
        for (let level of [AnnotationLevel.Error, AnnotationLevel.Warning, AnnotationLevel.Unchecked]) {
            for (let annotation of annotations) {
                if (annotation.level === level) {
                    return level;
                }
            }
        }
        return AnnotationLevel.Ok;
    }
}

export class CurrentlyCanBePaidCalculator {
    private readonly studentBody: IStudentBody;

    constructor(studentBody: IStudentBody) {
        this.studentBody = studentBody;
    }

    public calculateOverallLevel(): AnnotationLevel {
        if (!this.studentBody) {
            return AnnotationLevel.Unchecked;
        }

        const levels = [];
        if (!this.isMostRecentElectionYoungerThanOneYear()) {
            levels.push(AnnotationLevel.Error);
        }
        if (!this.getMostRecentElection()) {
            levels.push(AnnotationLevel.Error);
        } else {
            levels.push(getDocumentAnnotationLevel(this.getMostRecentElection()));
        }

        if (!this.getProceedingsOfMostRecentInauguralMeeting()) {
            levels.push(AnnotationLevel.Error);
        }

        const budgets = getDocumentsWithoutIssues(this.studentBody.budgets, true);
        const checkedBudgets = getCheckedDocumentsWithoutIssues(this.studentBody.budgets, true);
        for (let interval of [this.getCurrentFinancialYear(), this.getPreviousFinancialYear()]) {
            if (!interval.isCoveredBy(budgets)) {
                levels.push(AnnotationLevel.Error);
            } else if (!interval.isCoveredBy(checkedBudgets)) {
                levels.push(AnnotationLevel.Unchecked);
            }
        }

        let balances = getDocumentsWithoutIssues(this.studentBody.balances);
        if (!this.getPreviousFinancialYear().isCoveredBy(balances)) {
            levels.push(AnnotationLevel.Error);
        }

        let cashAudits = getDocumentsWithoutIssues(this.studentBody.cashAudits);
        if (!this.getPreviousFinancialYear().isCoveredBy(cashAudits)) {
            levels.push(AnnotationLevel.Error);
        }

        for (let interval of [this.getCurrentFinancialYear(), this.getPreviousFinancialYear()]) {
            if (interval.getOverlapping(budgets).some(value => !value.checked)) {
                levels.push(AnnotationLevel.Unchecked);
            }
            if (interval.getOverlapping(balances).some(value => !value.checked)) {
                levels.push(AnnotationLevel.Unchecked);
            }
            if (interval.getOverlapping(cashAudits).some(value => !value.checked)) {
                levels.push(AnnotationLevel.Unchecked);
            }
        }
        return getWorstAnnotationLevel([...levels, AnnotationLevel.Ok]);
    }

    public getProceedingsOfMostRecentInauguralMeeting(): IAnnotatedDocument | null {
        if (!this.studentBody) {
            return null;
        }
        let mostRecentProceeding = null;
        for (let proceeding of this.studentBody.proceedings) {
            if (proceeding.filename.includes('Konsti')) {
                if (!mostRecentProceeding || mostRecentProceeding.dateStart < proceeding.dateStart) {
                    mostRecentProceeding = proceeding;
                }
            }
        }
        return mostRecentProceeding;
    }

    public isMostRecentElectionYoungerThanOneYear(): boolean {
        const mostRecentElection = this.getMostRecentElection();
        if (!mostRecentElection) {
            return false;
        }

        const limit = new Date();
        limit.setFullYear(limit.getFullYear() - 1);
        return limit < stringToDate(mostRecentElection.dateEnd);
    }

    public getMostRecentElection(): IAnnotatedDocument | null {
        if (!this.studentBody) {
            return null;
        }
        let mostRecentElection = null;
        for (let electionResult of this.studentBody.electionResults) {
            if (!mostRecentElection || electionResult.dateEnd > mostRecentElection.dateEnd) {
                mostRecentElection = electionResult;
            }
        }
        return mostRecentElection;
    }

    public getRelevantBudgetsForCurrentFinancialYear(): IAnnotatedDocument[] {
        return this.getRelevantBudgets(this.getCurrentFinancialYear());
    }

    public getRelevantBudgetsForPreviousFinancialYear(): IAnnotatedDocument[] {
        return this.getRelevantBudgets(this.getPreviousFinancialYear());
    }

    public getRelevantBalancesForPreviousFinancialYear(): IAnnotatedDocument[] {
        return this.getRelevantBalances(this.getPreviousFinancialYear());
    }

    public getRelevantCashAuditsForPreviousFinancialYear(): IAnnotatedDocument[] {
        return this.getRelevantCashAudits(this.getPreviousFinancialYear());
    }

    private getRelevantBudgets(interval: Interval): IAnnotatedDocument[] {
        if (!this.studentBody) {
            return [];
        }
        return interval.getOverlapping(this.studentBody.budgets);
    }

    private getRelevantBalances(interval: Interval): IAnnotatedDocument[] {
        if (!this.studentBody) {
            return [];
        }
        return interval.getOverlapping(this.studentBody.balances);
    }

    private getRelevantCashAudits(interval: Interval): IAnnotatedDocument[] {
        if (!this.studentBody) {
            return [];
        }
        return interval.getOverlapping(this.studentBody.cashAudits);
    }

    public getCurrentFinancialYear(): Interval {
        if (!this.studentBody) {
            return null;
        }
        const startDay = parseInt(this.studentBody.financialYearStart.substring(0, 2));
        const startMonth = parseInt(this.studentBody.financialYearStart.substring(3, 5)) - 1;
        const now = new Date();
        const startDayCurrentFinancialYear = new Date(now.getFullYear(), startMonth, startDay);
        if (startDayCurrentFinancialYear > now) {
            startDayCurrentFinancialYear.setFullYear(startDayCurrentFinancialYear.getFullYear() - 1);
        }
        const endDayCurrentFinanicalYear = new Date(startDayCurrentFinancialYear.getFullYear() + 1, startDayCurrentFinancialYear.getMonth(), startDayCurrentFinancialYear.getDate());
        endDayCurrentFinanicalYear.setDate(endDayCurrentFinanicalYear.getDate() - 1);
        return new Interval(startDayCurrentFinancialYear, endDayCurrentFinanicalYear);
    }

    public getPreviousFinancialYear(): Interval {
        if (!this.studentBody) {
            return null;
        }
        const financialYear = this.getCurrentFinancialYear();
        financialYear.start.setFullYear(financialYear.start.getFullYear() - 1);
        financialYear.end.setFullYear(financialYear.end.getFullYear() - 1);
        return financialYear
    }
}

export class SemesterCalculator {
    private semester: Interval;
    private studentBody: IStudentBody;

    constructor(studentBody: IStudentBody, semester: Interval) {
        this.studentBody = studentBody;
        this.semester = semester;
    }


    public calculateOverallLevel(): AnnotationLevel {
        if (!this.studentBody) {
            return AnnotationLevel.Unchecked;
        }

        const levels = [];
        if (!this.getMostRecentElection()) {
            levels.push(AnnotationLevel.Error);
        } else {
            levels.push(getDocumentAnnotationLevel(this.getMostRecentElection()));
        }

        const budgets = this.semester.getOverlapping(getDocumentsWithoutIssues(this.studentBody.budgets, true));
        const checkedBudgets = this.semester.getOverlapping(getCheckedDocumentsWithoutIssues(this.studentBody.budgets, true));
        if (!this.semester.isCoveredBy(budgets)) {
            levels.push(AnnotationLevel.Error);
        } else if (!this.semester.isCoveredBy(checkedBudgets)) {
            levels.push(AnnotationLevel.Unchecked);
        }

        const balances = this.semester.getOverlapping(getDocumentsWithoutIssues(this.studentBody.balances));
        const checkedBalances = this.semester.getOverlapping(getCheckedDocumentsWithoutIssues(this.studentBody.balances));
        if (!this.semester.isCoveredBy(balances)) {
            levels.push(AnnotationLevel.Error);
        } else if (!this.semester.isCoveredBy(checkedBalances)) {
            levels.push(AnnotationLevel.Unchecked);
        }

        const cashAudits = this.semester.getOverlapping(getDocumentsWithoutIssues(this.studentBody.cashAudits, true));
        const checkedCashAudits = this.semester.getOverlapping(getCheckedDocumentsWithoutIssues(this.studentBody.cashAudits, true));
        if (!this.semester.isCoveredBy(cashAudits)) {
            levels.push(AnnotationLevel.Error);
        } else if (!this.semester.isCoveredBy(checkedCashAudits)) {
            levels.push(AnnotationLevel.Unchecked);
        }

        return getWorstAnnotationLevel([...levels, AnnotationLevel.Ok]);
    }


    public getMostRecentElection(): IAnnotatedDocument | null {
        if (!this.studentBody) {
            return null;
        }
        const searchArea = new Interval(new Date(this.semester.end.getFullYear() - 1, this.semester.end.getMonth(), this.semester.end.getDate() + 1), this.semester.end);
        let mostRecentElection = null;
        for (let electionResult of searchArea.getOverlapping(this.studentBody.electionResults)) {
            if (!mostRecentElection || electionResult.dateEnd > mostRecentElection.dateEnd) {
                mostRecentElection = electionResult;
            }
        }
        return mostRecentElection;
    }

    public getRelevantBudgets(): IAnnotatedDocument[] {
        if (!this.studentBody) {
            return [];
        }
        return this.semester.getOverlapping(this.studentBody.budgets);
    }

    public getRelevantBalances(): IAnnotatedDocument[] {
        if (!this.studentBody) {
            return [];
        }
        return this.semester.getOverlapping(this.studentBody.balances);
    }

    public getRelevantCashAudits(): IAnnotatedDocument[] {
        if (!this.studentBody) {
            return [];
        }
        return this.semester.getOverlapping(this.studentBody.cashAudits);
    }
}
