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
    proceedingsUrl: string | null
    budgets: IAnnotatedDocument[]
    balances: IAnnotatedDocument[]
    cashAudits: IAnnotatedDocument[]
    proceedings: IAnnotatedDocument[]
    electionResults: IAnnotatedDocument[]
}

export type IStudentBodyDocumentsKey = 'balances' | 'budgets' | 'cashAudits' | 'electionResults' | 'proceedings';

export interface IPayoutRequestData {
    id: string
    status: string
    amount: number
    requestDate: string
}

export interface INewPayoutRequestData {
    fs: string
    semester: string
    status: string
    status_date: string
    amount_cents: number
    comment: string
    request_id: string
    request_date: string
    completion_deadline: string
    type: string
    category: string
    reference: string | null
}

export interface IFullPayoutRequestData extends INewPayoutRequestData {
    requester?: string
    last_modified_timestamp?: string
    last_modified_by?: string
}

export interface ISemester {
    start: string
    end: string
}

export interface IData {
    budgetTitles: { [semester: string]: string }
    budgetTitlesBfsg: { [semester: string]: string }
    payoutRequests: Map<string, Map<string, IPayoutRequestData>>
    semesters: ISemester[]
    studentBodies: Map<string, IStudentBody>
    timestamp: number
}

export interface IUserWithPermissions {
    username: string
    admin: boolean
    permissions: IPermission[]
    created_by: string
}

export interface IPermission {
    fs: string
    read_permissions: boolean
    write_permissions: boolean
    read_files: boolean
    read_public_data: boolean
    write_public_data: boolean
    read_protected_data: boolean
    write_protected_data: boolean
    submit_payout_request: boolean
    locked: boolean
}

export type IPermissionKey = 'read_permissions' | 'write_permissions' | 'read_files' | 'read_public_data' |
    'write_public_data' | 'read_protected_data' | 'write_protected_data' | 'submit_payout_request' | 'locked'


export interface IPayoutRequestDiff {
    fs: string;
    semester: string;
    type: string;
    oldPR: INewPayoutRequestData | null;
    newPR: INewPayoutRequestData | null;
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
    modifiedBfsg: IPayoutRequestDiff[];
    modifiedVorankuendigung: IPayoutRequestDiff[];
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

export interface IFsDataResponse {
    data: IFsData
    is_latest: boolean
}

export interface IFsDataHistoryEntry extends IFsData {
    id: number
    user: string
    timestamp: string
    approved: boolean
    approved_by?: string
    approval_timestamp?: string
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

export interface IProtectedFsDataHistoryEntry extends IProtectedFsData {
    id: number
    user: string
    timestamp: string
    approved: boolean
    approved_by?: string
    approval_timestamp?: string
}

export interface IProtectedFsDataResponse {
    data: IProtectedFsData
    is_latest: boolean
}

export interface IAllFsData {
    [key: string]: { data?: IFsDataResponse, protected_data?: IProtectedFsDataResponse }
}
