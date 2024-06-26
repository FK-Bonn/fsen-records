import type {IAnnotatedDocument, IAnnotation, IStudentBody} from "@/interfaces";
import {AnnotationLevel} from "@/interfaces";
import {getDocumentAnnotationLevel, getDocumentsWithLevels, getWorstAnnotationLevel, stringToDate} from "@/util";

export class Interval {
    start: Date
    end: Date

    constructor(start: Date, end: Date) {
        this.start = start;
        this.end = end;
    }

    static fromStrings(start?: string, end?: string): Interval | undefined {
        if (!start || !end) {
            return;
        }
        const startDate = stringToDate(start);
        const endDate = stringToDate(end);
        return new Interval(startDate, endDate);
    }

    public getOverlapping(others: IAnnotatedDocument[]): IAnnotatedDocument[] {
        const overlapping: IAnnotatedDocument[] = [];
        for (const other of others) {
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
        for (const other of sortedOthers) {
            const otherStart = stringToDate(other.dateStart);
            if (otherStart > remainingStart) {
                return false;
            }
            const otherEnd = other.dateEnd ? stringToDate(other.dateEnd) : otherStart;
            if (otherEnd >= remainingStart) {
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
        for (const level of [AnnotationLevel.Error, AnnotationLevel.Warning, AnnotationLevel.Unchecked]) {
            for (const annotation of annotations) {
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
    private readonly date: string | null;

    constructor(studentBody: IStudentBody, fixedDate: string | null) {
        this.studentBody = studentBody;
        this.date = fixedDate;
    }

    public calculateOverallLevel(): AnnotationLevel {
        if (!this.studentBody) {
            return AnnotationLevel.Unchecked;
        }

        const levels = [];
        levels.push(this.getElectionLevel());
        levels.push(this.getProceedingsOfLastInauguralMeetingLevel());
        levels.push(this.getCurrentFinancialYearBudgetLevel());
        levels.push(this.getPreviousFinancialYearBudgetLevel());
        levels.push(this.getBalanceLevel());
        levels.push(this.getCashAuditLevel());
        return getWorstAnnotationLevel(levels);
    }


    public getElectionLevel(): AnnotationLevel {
        const levels = [];
        if (!this.isMostRecentElectionYoungerThanOneYear()) {
            levels.push(AnnotationLevel.Error);
        }
        const mostRecentElection = this.getMostRecentElection();
        if (!mostRecentElection) {
            levels.push(AnnotationLevel.Error);
        } else {
            levels.push(getDocumentAnnotationLevel(mostRecentElection));
        }
        return getWorstAnnotationLevel(levels);
    }

    public getProceedingsOfLastInauguralMeetingLevel(): AnnotationLevel {
        const levels = [];
        const proceedings = this.getProceedingsOfMostRecentInauguralMeeting();
        if (!proceedings) {
            levels.push(AnnotationLevel.Error);
        } else {
            levels.push(getDocumentAnnotationLevel(proceedings));
            levels.push(this.areProceedingsOfLastInauguralMeetingYoungerThanLastElectionLevel(proceedings));
        }
        return getWorstAnnotationLevel(levels);
    }

    public areProceedingsOfLastInauguralMeetingYoungerThanLastElectionLevel(proceedings: IAnnotatedDocument|null): AnnotationLevel {
        const election = this.getMostRecentElection();
        if (election && election.dateEnd && proceedings) {
            if (election.dateEnd > proceedings.dateStart) {
                return AnnotationLevel.Error;
            } else {
                return AnnotationLevel.Ok;
            }
        } else {
            return AnnotationLevel.Unchecked;
        }
    }

    public getPreviousFinancialYearBudgetLevel(): AnnotationLevel {
        return this.getBudgetLevel(this.getPreviousFinancialYear());
    }

    public isPreviousFinanicalYearCoveredByBudgets(): boolean {
        return this.getPreviousFinancialYear()?.isCoveredBy(this.studentBody.budgets) || false;
    }

    public getCurrentFinancialYearBudgetLevel(): AnnotationLevel {
        return this.getBudgetLevel(this.getCurrentFinancialYear());
    }

    public isCurrentFinanicalYearCoveredByBudgets(): boolean {
        return this.getCurrentFinancialYear()?.isCoveredBy(this.studentBody.budgets) || false;
    }

    private getBudgetLevel(interval: Interval | undefined): AnnotationLevel {
        return this.getLevelForDocuments(interval, this.studentBody.budgets, true);
    }

    public getBalanceLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.getPreviousFinancialYear(), this.studentBody.balances);
    }

    public getCashAuditLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.getPreviousFinancialYear(), this.studentBody.cashAudits, true);
    }

    public isPreviousFinancialYearCoveredByCashAudits(): boolean {
        return this.getPreviousFinancialYear()?.isCoveredBy(this.studentBody.cashAudits) || false;
    }

    private getLevelForDocuments(interval: Interval | undefined, documents: IAnnotatedDocument[], requireResolvedReference: boolean = false): AnnotationLevel {
        if (!interval) {
            return AnnotationLevel.Error;
        }
        const allowedLevels = [];
        for (const level of [AnnotationLevel.Ok, AnnotationLevel.Warning, AnnotationLevel.Unchecked]) {
            allowedLevels.push(level);
            const budgets = interval.getOverlapping(getDocumentsWithLevels(documents, allowedLevels, requireResolvedReference));
            if (interval.isCoveredBy(budgets)) {
                return level;
            }
        }
        return AnnotationLevel.Error;
    }

    public getProceedingsOfMostRecentInauguralMeeting(): IAnnotatedDocument | null {
        if (!this.studentBody) {
            return null;
        }
        let mostRecentProceeding = null;
        for (const proceeding of this.studentBody.proceedings) {
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
        if (!mostRecentElection || !mostRecentElection.dateEnd) {
            return false;
        }

        const limit = this.date ? new Date(this.date) : new Date();
        limit.setFullYear(limit.getFullYear() - 1);
        return limit < stringToDate(mostRecentElection.dateEnd);
    }

    public getMostRecentElection(): IAnnotatedDocument | null {
        if (!this.studentBody) {
            return null;
        }
        let mostRecentElection = null;
        for (const electionResult of this.studentBody.electionResults) {
            if (!mostRecentElection || (electionResult.dateEnd && mostRecentElection.dateEnd && (electionResult.dateEnd > mostRecentElection.dateEnd))) {
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

    private getRelevantBudgets(interval: Interval | undefined): IAnnotatedDocument[] {
        if (!this.studentBody || !interval) {
            return [];
        }
        return interval.getOverlapping(this.studentBody.budgets);
    }

    private getRelevantBalances(interval: Interval | undefined): IAnnotatedDocument[] {
        if (!this.studentBody || !interval) {
            return [];
        }
        return interval.getOverlapping(this.studentBody.balances);
    }

    private getRelevantCashAudits(interval: Interval | undefined): IAnnotatedDocument[] {
        if (!this.studentBody || !interval) {
            return [];
        }
        return interval.getOverlapping(this.studentBody.cashAudits);
    }

    public getCurrentFinancialYear(): Interval | undefined {
        if (!this.studentBody) {
            return;
        }
        if (this.studentBody.financialYearOverride) {
            const start = new Date(Date.parse(this.studentBody.financialYearOverride.current.dateStart));
            const end = new Date(Date.parse(this.studentBody.financialYearOverride.current.dateEnd));
            return new Interval(start, end);
        }
        const startDay = parseInt(this.studentBody.financialYearStart.substring(0, 2));
        const startMonth = parseInt(this.studentBody.financialYearStart.substring(3, 5)) - 1;
        const now = this.date ? new Date(this.date) : new Date();
        const startDayCurrentFinancialYear = new Date(now.getFullYear(), startMonth, startDay);
        if (startDayCurrentFinancialYear > now) {
            startDayCurrentFinancialYear.setFullYear(startDayCurrentFinancialYear.getFullYear() - 1);
        }
        const endDayCurrentFinanicalYear = new Date(startDayCurrentFinancialYear.getFullYear() + 1, startDayCurrentFinancialYear.getMonth(), startDayCurrentFinancialYear.getDate());
        endDayCurrentFinanicalYear.setDate(endDayCurrentFinanicalYear.getDate() - 1);
        return new Interval(startDayCurrentFinancialYear, endDayCurrentFinanicalYear);
    }

    public getPreviousFinancialYear(): Interval | undefined {
        if (!this.studentBody) {
            return;
        }
        if (this.studentBody.financialYearOverride) {
            const start = new Date(Date.parse(this.studentBody.financialYearOverride.previous.dateStart));
            const end = new Date(Date.parse(this.studentBody.financialYearOverride.previous.dateEnd));
            return new Interval(start, end);
        }
        const financialYear = this.getCurrentFinancialYear();
        if (financialYear) {
            financialYear.start.setFullYear(financialYear.start.getFullYear() - 1);
            financialYear.end.setFullYear(financialYear.end.getFullYear() - 1);
        }
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
        levels.push(this.getBudgetLevel());
        levels.push(this.getBalanceLevel());
        levels.push(this.getCashAuditLevel());
        levels.push(this.getElectionLevel());
        return getWorstAnnotationLevel(levels);
    }

    public getElectionLevel(): AnnotationLevel {
        const levels = [];
        const mostRecentElection = this.getMostRecentElection();
        if (!mostRecentElection) {
            levels.push(AnnotationLevel.Error);
        } else {
            levels.push(getDocumentAnnotationLevel(mostRecentElection));
        }
        return getWorstAnnotationLevel(levels);
    }

    public getBudgetLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.studentBody.budgets, true);
    }

    public isSemesterCoveredByBudgets(): boolean {
        return this.semester.isCoveredBy(this.studentBody.budgets);
    }

    public getBalanceLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.studentBody.balances);
    }

    public isSemesterCoveredByBalances(): boolean {
        return this.semester.isCoveredBy(this.studentBody.balances);
    }

    public getCashAuditLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.studentBody.cashAudits, true);
    }

    public isSemesterCoveredByCashAudits(): boolean {
        return this.semester.isCoveredBy(this.studentBody.cashAudits);
    }

    private getLevelForDocuments(documents: IAnnotatedDocument[], requireResolvedReference: boolean = false): AnnotationLevel {
        const allowedLevels = [];
        for (const level of [AnnotationLevel.Ok, AnnotationLevel.Warning, AnnotationLevel.Unchecked]) {
            allowedLevels.push(level);
            const budgets = this.semester.getOverlapping(getDocumentsWithLevels(documents, allowedLevels, requireResolvedReference));
            if (this.semester.isCoveredBy(budgets)) {
                return level;
            }
        }
        return AnnotationLevel.Error;
    }

    public getMostRecentElection(): IAnnotatedDocument | null {
        if (!this.studentBody) {
            return null;
        }
        const searchArea = new Interval(new Date(this.semester.end.getFullYear() - 1, this.semester.end.getMonth(), this.semester.end.getDate() + 1), this.semester.end);
        let mostRecentElection = null;
        for (const electionResult of searchArea.getOverlapping(this.studentBody.electionResults)) {
            if (!mostRecentElection || (electionResult.dateEnd && mostRecentElection.dateEnd && (electionResult.dateEnd > mostRecentElection.dateEnd))) {
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
