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
    name: string
    statutes: string
    financialYearStart: string
    budgets: IAnnotatedDocument[]
    balances: IAnnotatedDocument[]
    cashAudits: IAnnotatedDocument[]
    proceedings: IAnnotatedDocument[]
    electionResults: IAnnotatedDocument[]
}

export interface IData {
    studentBodies: Map<string, IStudentBody>
    timestamp: number
}
