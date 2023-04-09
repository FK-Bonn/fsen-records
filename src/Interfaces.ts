export enum AnnotationLevel {
    Error = "Error",
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
    financialYearAnnotation: string
    financialYearOverride: null | { current: { dateStart: string, dateEnd: string }, previous: { dateStart: string, dateEnd: string } }
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
    requestDate: string
}

export interface INewPayoutRequestData {
    fs: string,
    semester: string,
    status: "string",
    status_date: string,
    amount_cents: number,
    comment: string,
    request_id: string,
    request_date: string,
    requester: string,
    last_modified_timestamp: string,
    last_modified_by: string,
}

export interface ISemester {
    start: string
    end: string
}

export interface IData {
    budgetTitles: { [semester: string]: string }
    payoutRequests: Map<string, Map<string, IPayoutRequestData>>
    semesters: ISemester[]
    studentBodies: Map<string, IStudentBody>
    timestamp: number
}

export interface IUserWithPermissions {
    username: string
    admin: boolean
    permissions: IPermission[]
}

export interface IPermission {
    fs: string
    level: number
}


export interface IPayoutRequestDiff {
    fs: string;
    semester: string;
    oldPR: IPayoutRequestData | null;
    newPR: IPayoutRequestData | null;
}

export interface IStringDiff {
    oldString: string | null;
    newString: string | null;
}

export interface IAnnotatedDocumentDiff {
    filename: string;
    oldDocument: IAnnotatedDocument | null;
    newDocument: IAnnotatedDocument | null;
}

export interface IStudentBodyDiff {
    fs: string;
    name: string;
    balances: IAnnotatedDocumentDiff[];
    budgets: IAnnotatedDocumentDiff[];
    cashAudits: IAnnotatedDocumentDiff[];
    electionResults: IAnnotatedDocumentDiff[];
    proceedings: IAnnotatedDocumentDiff[];
    financialYearAnnotationDiff: IStringDiff | null;
    statutesDiff: IStringDiff | null;
    modifiedPayoutRequests: IPayoutRequestDiff[];
}

export interface IEmailAddress {
    address: string
    usages: string[]
}

export interface IFsData {
    email: string
    phone: string
    website: string
    address: string
    serviceTimes: IServiceTimes
    regularMeeting: IRegularMeeting
    other: object
}

export interface IServiceTimes {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
}

export interface IRegularMeeting {
    dayOfWeek: string
    time: string
    location: string
}

export interface IProtectedFsData {
    email_addresses: IEmailAddress[]
    iban: string
    bic: string
    other: object
}

export interface IAllFsData {
    [key: string]: { data?: IFsData, protected_data?: IProtectedFsData }
}
