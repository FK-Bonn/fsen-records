export enum AnnotationLevel {
    Error= "Error",
    Warning = "Warning",
    Info = "Info",
    Unchecked = "Unchecked",
    Ok = "Ok",
}

export interface IAnnotation {
    level: AnnotationLevel
    text: string
}

export interface IAnnotatedDocument {
    filename: string
    dateStart: string
    dateEnd?: string
    checked: boolean
    references: string[]
    resolvedReferences?: IAnnotatedDocument[]
    annotations: IAnnotation[]
}

export interface IStudentBody {
    id: string
    name: string
    statutes: string
    financialYearStart: string
    financialYearOverride: null | {current: {dateStart: string, dateEnd: string}, previous: {dateStart: string, dateEnd: string}}
    budgets: IAnnotatedDocument[]
    balances: IAnnotatedDocument[]
    cashAudits: IAnnotatedDocument[]
    proceedings: IAnnotatedDocument[]
    electionResults: IAnnotatedDocument[]
}

export interface IPayoutRequestData {
    id: string
    status: string
    amount: number
}

export interface IData {
    payoutRequests: Map<string, Map<string, Map<string, IPayoutRequestData>>>
    studentBodies: Map<string, IStudentBody>
    timestamp: number
}
