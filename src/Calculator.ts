import {
    AnnotationLevel,
    type IAnnotation,
    type IBaseFsData,
    type IDocumentData,
    type IDocumentDataForFs
} from "@/interfaces";
import {getDocumentAnnotationLevel, getWorstAnnotationLevel, isReferenced, stringToDate} from "@/util";

export class Interval {
    start: Date
    end: Date

    constructor(start: Date, end: Date) {
        this.start = start;
        this.end = end;
    }

    static fromStrings(start?: string | null, end?: string | null): Interval | undefined {
        if (!start || !end) {
            return;
        }
        const startDate = stringToDate(start);
        const endDate = stringToDate(end);
        return new Interval(startDate, endDate);
    }

    public getOverlapping(others: IDocumentData[]): IDocumentData[] {
        const overlapping: IDocumentData[] = [];
        for (const other of others) {
            if (!other.date_start) {
                continue;
            }
            const otherStart = stringToDate(other.date_start);
            if (!other.date_end) {
                if (this.start <= otherStart && this.end >= otherStart) {
                    overlapping.push(other);
                }
            } else {
                const otherEnd = stringToDate(other.date_end);
                if (otherStart > this.end || otherEnd < this.start) {
                    continue;
                }
                overlapping.push(other);
            }
        }
        return overlapping;
    }

    public isCoveredBy(others: IDocumentData[]): boolean {
        let remainingStart = this.start;
        const sortedOthers = [...others];
        sortedOthers.sort((a, b) => (a.date_start && b.date_start) ? a.date_start.localeCompare(b.date_start) : 0)
        for (const other of sortedOthers) {
            if (!other.date_start) {
                continue;
            }
            const otherStart = stringToDate(other.date_start);
            if (otherStart > remainingStart) {
                return false;
            }
            const otherEnd = other.date_end ? stringToDate(other.date_end) : otherStart;
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
    public static getWorstAnnotationLevel(annotations: IAnnotation[] | null): AnnotationLevel {
        if (annotations === null) {
            return AnnotationLevel.Unchecked;
        }
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
    private readonly baseData: IBaseFsData;
    private readonly date: string | null;
    private documents: IDocumentData[];
    private electionResults: IDocumentData[];
    private proceedings: IDocumentData[];
    private budgets: IDocumentData[];
    private balances: IDocumentData[];
    private cashAudits: IDocumentData[];

    constructor(baseData: IBaseFsData, fixedDate: string | null, documents: IDocumentDataForFs | null) {
        this.baseData = baseData;
        this.date = fixedDate;
        this.documents = [];
        this.electionResults = [];
        this.proceedings = [];
        this.budgets = [];
        this.balances = [];
        this.cashAudits = [];
        if (documents && this.baseData.fs_id in documents) {
            this.documents = documents[this.baseData.fs_id];
            this.electionResults = this.documents.filter(value => value.base_name === 'Wahlergebnis');
            this.proceedings = this.documents.filter(value => value.base_name === 'Prot');
            this.budgets = this.documents.filter(value => value.base_name === 'HHP' || value.base_name.startsWith('NHHP'));
            this.balances = this.documents.filter(value => value.base_name === 'HHR');
            this.cashAudits = this.documents.filter(value => value.base_name === 'KP');
        }
    }

    public calculateOverallLevel(): AnnotationLevel {
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

    public areProceedingsOfLastInauguralMeetingYoungerThanLastElectionLevel(proceedings: IDocumentData | null): AnnotationLevel {
        const election = this.getMostRecentElection();
        if (election && election.date_end && proceedings && proceedings.date_start) {
            if ((election.date_end > proceedings.date_start)) {
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
        return this.getPreviousFinancialYear()?.isCoveredBy(this.budgets) || false;
    }

    public getCurrentFinancialYearBudgetLevel(): AnnotationLevel {
        const budget = this.getMostRecentBudgetForCurrentFinancialYear();
        if (!budget) {
            return AnnotationLevel.Error;
        }
        const references = this.documents.filter(value => isReferenced(value, budget.references));
        return getDocumentAnnotationLevel(budget, true, references)
    }

    public isCurrentFinanicalYearCoveredByBudgets(): boolean {
        return this.getCurrentFinancialYear()?.isCoveredBy(this.budgets) || false;
    }

    private getBudgetLevel(interval: Interval | undefined): AnnotationLevel {
        return this.getLevelForDocuments(interval, this.budgets, true);
    }

    public getBalanceLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.getPreviousFinancialYear(), this.balances);
    }

    public getCashAuditLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.getPreviousFinancialYear(), this.cashAudits, true);
    }

    public isPreviousFinancialYearCoveredByCashAudits(): boolean {
        return this.getPreviousFinancialYear()?.isCoveredBy(this.cashAudits) || false;
    }

    private getLevelForDocuments(interval: Interval | undefined, documents: IDocumentData[], requireReference: boolean = false): AnnotationLevel {
        if (!interval) {
            return AnnotationLevel.Error;
        }
        const allowedLevels = [];
        for (const level of [AnnotationLevel.Ok, AnnotationLevel.Warning, AnnotationLevel.Unchecked]) {
            allowedLevels.push(level);
            const budgets = interval.getOverlapping(this.getDocumentsWithLevels(documents, allowedLevels, requireReference));
            if (interval.isCoveredBy(budgets)) {
                return level;
            }
        }
        return AnnotationLevel.Error;
    }

    private getDocumentsWithLevels(documents: IDocumentData[], allowedLevels: AnnotationLevel[], requireReference = false): IDocumentData[] {
        const documentsWithLevels = [];
        for (const document of documents) {
            const references = this.documents.filter(value => isReferenced(value, document.references));
            const level = getDocumentAnnotationLevel(document, requireReference, references);
            if (allowedLevels.includes(level)) {
                documentsWithLevels.push(document);
            }
        }
        return documentsWithLevels;
    }

    public getProceedingsOfMostRecentInauguralMeeting(): IDocumentData | null {
        let mostRecentProceeding = null;
        for (const proceeding of this.proceedings) {
            if (proceeding.tags?.some(value => value.includes('Konsti'))) {
                if (!mostRecentProceeding ||
                    (mostRecentProceeding.date_start
                        && proceeding.date_start
                        && mostRecentProceeding.date_start < proceeding.date_start)
                ) {
                    mostRecentProceeding = proceeding;
                }
            }
        }
        return mostRecentProceeding;
    }

    public isMostRecentElectionYoungerThanOneYear(): boolean {
        const mostRecentElection = this.getMostRecentElection();
        if (!mostRecentElection || !mostRecentElection.date_end) {
            return false;
        }

        const limit = this.date ? new Date(this.date) : new Date();
        limit.setFullYear(limit.getFullYear() - 1);
        return limit < stringToDate(mostRecentElection.date_end);
    }

    public getMostRecentElection(): IDocumentData | null {
        let mostRecentElection = null;
        for (const electionResult of this.electionResults) {
            if (!mostRecentElection || (electionResult.date_end && mostRecentElection.date_end && (electionResult.date_end > mostRecentElection.date_end))) {
                mostRecentElection = electionResult;
            }
        }
        return mostRecentElection;
    }

    public getRelevantBudgetsForCurrentFinancialYear(): IDocumentData[] {
        return this.getRelevantBudgets(this.getCurrentFinancialYear());
    }

    public getMostRecentBudgetForCurrentFinancialYear(): IDocumentData | null {
        const budgets = this.getRelevantBudgetsForCurrentFinancialYear();
        budgets.sort((a, b) => b.base_name.localeCompare(a.base_name));
        budgets.sort((a, b) => (a.date_start && b.date_start) ? b.date_start.localeCompare(a.date_start) : 0);
        if (budgets.length) {
            return budgets[0];
        }
        return null;
    }

    public getRelevantBudgetsForPreviousFinancialYear(): IDocumentData[] {
        return this.getRelevantBudgets(this.getPreviousFinancialYear());
    }

    public getRelevantBalancesForPreviousFinancialYear(): IDocumentData[] {
        return this.getRelevantBalances(this.getPreviousFinancialYear());
    }

    public getRelevantCashAuditsForPreviousFinancialYear(): IDocumentData[] {
        return this.getRelevantCashAudits(this.getPreviousFinancialYear());
    }

    private getRelevantBudgets(interval: Interval | undefined): IDocumentData[] {
        if (!interval) {
            return [];
        }
        return interval.getOverlapping(this.budgets);
    }

    private getRelevantBalances(interval: Interval | undefined): IDocumentData[] {
        if (!interval) {
            return [];
        }
        return interval.getOverlapping(this.balances);
    }

    private getRelevantCashAudits(interval: Interval | undefined): IDocumentData[] {
        if (!interval) {
            return [];
        }
        return interval.getOverlapping(this.cashAudits);
    }

    public getCurrentFinancialYear(): Interval | undefined {
        if (this.baseData.financial_year_override) {
            const start = new Date(Date.parse(this.baseData.financial_year_override.current.date_start));
            const end = new Date(Date.parse(this.baseData.financial_year_override.current.date_end));
            return new Interval(start, end);
        }
        const startDay = parseInt(this.baseData.financial_year_start.substring(0, 2));
        const startMonth = parseInt(this.baseData.financial_year_start.substring(3, 5)) - 1;
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
        if (this.baseData.financial_year_override) {
            const start = new Date(Date.parse(this.baseData.financial_year_override.previous.date_start));
            const end = new Date(Date.parse(this.baseData.financial_year_override.previous.date_end));
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
    private baseData: IBaseFsData;
    private documents: IDocumentData[];
    private electionResults: IDocumentData[];
    private proceedings: IDocumentData[];
    private budgets: IDocumentData[];
    private balances: IDocumentData[];
    private cashAudits: IDocumentData[];

    constructor(baseData: IBaseFsData, semester: Interval, documents: IDocumentDataForFs | null) {
        this.baseData = baseData;
        this.semester = semester;
        this.documents = [];
        this.electionResults = [];
        this.proceedings = [];
        this.budgets = [];
        this.balances = [];
        this.cashAudits = [];
        if(documents && baseData.fs_id in documents){
            this.documents = documents[baseData.fs_id];
            this.electionResults = this.documents.filter(value => value.base_name === 'Wahlergebnis');
            this.proceedings = this.documents.filter(value => value.base_name === 'Prot');
            this.budgets = this.documents.filter(value => value.base_name === 'HHP' || value.base_name.startsWith('NHHP'));
            this.balances = this.documents.filter(value => value.base_name === 'HHR');
            this.cashAudits = this.documents.filter(value => value.base_name === 'KP');
        }
    }


    public calculateOverallLevel(): AnnotationLevel {
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
        return this.getLevelForDocuments(this.budgets, true);
    }

    public isSemesterCoveredByBudgets(): boolean {
        return this.semester.isCoveredBy(this.budgets);
    }

    public getBalanceLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.balances);
    }

    public isSemesterCoveredByBalances(): boolean {
        return this.semester.isCoveredBy(this.balances);
    }

    public getCashAuditLevel(): AnnotationLevel {
        return this.getLevelForDocuments(this.cashAudits, true);
    }

    public isSemesterCoveredByCashAudits(): boolean {
        return this.semester.isCoveredBy(this.cashAudits);
    }

    private getLevelForDocuments(documents: IDocumentData[], requireReference: boolean = false): AnnotationLevel {
        const allowedLevels = [];
        for (const level of [AnnotationLevel.Ok, AnnotationLevel.Warning, AnnotationLevel.Unchecked]) {
            allowedLevels.push(level);
            const budgets = this.semester.getOverlapping(this.getDocumentsWithLevels(documents, allowedLevels, requireReference));
            if (this.semester.isCoveredBy(budgets)) {
                return level;
            }
        }
        return AnnotationLevel.Error;
    }

    private getDocumentsWithLevels(documents: IDocumentData[], allowedLevels: AnnotationLevel[], requireReference = false): IDocumentData[] {
        const documentsWithLevels = [];
        for (const document of documents) {
            const references = this.documents.filter(value => isReferenced(value, document.references));
            const level = getDocumentAnnotationLevel(document, requireReference, references);
            if (allowedLevels.includes(level)) {
                documentsWithLevels.push(document);
            }
        }
        return documentsWithLevels;
    }

    public getMostRecentElection(): IDocumentData | null {
        const searchArea = new Interval(new Date(this.semester.end.getFullYear() - 1, this.semester.end.getMonth(), this.semester.end.getDate() + 1), this.semester.end);
        let mostRecentElection = null;
        for (const electionResult of searchArea.getOverlapping(this.electionResults)) {
            if (!mostRecentElection || (electionResult.date_end && mostRecentElection.date_end && (electionResult.date_end > mostRecentElection.date_end))) {
                mostRecentElection = electionResult;
            }
        }
        return mostRecentElection;
    }

    public getRelevantBudgets(): IDocumentData[] {
        return this.semester.getOverlapping(this.budgets);
    }

    public getRelevantBalances(): IDocumentData[] {
        return this.semester.getOverlapping(this.balances);
    }

    public getRelevantCashAudits(): IDocumentData[] {
        return this.semester.getOverlapping(this.cashAudits);
    }
}
