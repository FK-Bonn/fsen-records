export enum AnnotationLevel {
    Error = "Error",
    Warning = "Warning",
    Info = "Info",
    Unchecked = "Unchecked",
    Ok = "Ok",
    Obsolete = "Obsolete",
}

export interface IAnnotation {
    level: AnnotationLevel
    text: string
}

export interface IDocumentData {
    category: string
    request_id: string
    base_name: string
    date_start?: string
    date_end?: string
    file_extension: string
    sha256hash: string
    filename: string
    created_timestamp?: string
    uploaded_by?: string
    tags: string[] | null
    references: IDocumentReference[] | null
    url: string | null
    annotations: IAnnotation[] | null
    annotations_created_timestamp?: string | null
    annotations_created_by?: string | null
}

export interface IDocumentHistoryData extends IDocumentData {
    deleted_by: string | null
    deleted_timestamp: string | null
    obsoleted_by: string | null
    obsoleted_timestamp: string | null
}

export interface IDocumentDataForFs {
    [key: string]: IDocumentData[]
}

export interface IProceedingsLocation {
    url: string
    annotation: string
}

export interface IStudentBody {
    id: string
    name: string
    statutes: string
    financialYearStart: string
    financialYearAnnotation: string
    financialYearOverride: null | { current: { dateStart: string, dateEnd: string }, previous: { dateStart: string, dateEnd: string } }
    proceedingsUrl: string | null | IProceedingsLocation[]
    // budgets: IAnnotatedDocument[]
    // balances: IAnnotatedDocument[]
    // cashAudits: IAnnotatedDocument[]
    // proceedings: IAnnotatedDocument[]
    // electionResults: IAnnotatedDocument[]
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
}

export interface IUserWithPermissions {
    username: string
    full_name: string
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
    upload_proceedings: boolean
    delete_proceedings: boolean
    upload_documents: boolean
    locked: boolean
}

export type IPermissionKey = 'read_permissions' | 'write_permissions' | 'read_files' | 'read_public_data' |
    'write_public_data' | 'read_protected_data' | 'write_protected_data' | 'submit_payout_request' |
    'upload_proceedings' | 'delete_proceedings' | 'upload_documents' | 'locked'


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
    oldDocument: IDocumentData | null;
    newDocument: IDocumentData | null;
}

export interface IStudentBodyDiff {
    fs: string;
    name: string;
    documents: IAnnotatedDocumentDiff[];
    annotationDiff: IStringDiff | null;
    statutesDiff: IStringDiff | null;
    modifiedPayoutRequests: IPayoutRequestDiff[];
    modifiedBfsg: IPayoutRequestDiff[];
    modifiedVorankuendigung: IPayoutRequestDiff[];
    financialYearStartDiff: IStringDiff | null;
    proceedingsUrlDiff: IStringDiff | null;
}

export interface IEmailAddress {
    address: string
    usages: string[]
}

export interface IInterval {
    date_start: string
    date_end: string
}

export interface IFinancialYearOverride {
    previous: IInterval
    current: IInterval
}

export interface IAnnotatedUrl {
    url: string
    annotation: string
}

export interface IBaseFsData {
    fs_id: string
    name: string
    statutes: string
    financial_year_start: string
    financial_year_override: IFinancialYearOverride | null
    proceedings_urls: IAnnotatedUrl[]
    annotation: string
    active: boolean
}

export interface IBaseFsDataResponse {
    data: IBaseFsData
    is_latest: boolean
}

export interface IBaseFsDataHistoryEntry extends IBaseFsData {
    id: number
    user: string
    timestamp: string
    approved: boolean
    approved_by?: string
    approval_timestamp?: string
}

export interface IPublicFsData {
    email: string
    phone: string
    website: string
    address: string
    serviceTimes: IServiceTimes
    regularMeeting: IRegularMeeting
    other: object
}

export interface IPublicFsDataResponse {
    data: IPublicFsData
    is_latest: boolean
}

export interface IPublicFsDataHistoryEntry extends IPublicFsData {
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

export interface ISingleFsData {
    base: IBaseFsDataResponse | null,
    public: IPublicFsDataResponse | null,
    protected: IProtectedFsDataResponse | null
}

export interface IAllFsData {
    [key: string]: ISingleFsData
}

export interface IProceedings {
    fs: string
    committee: string
    date: string
    tags: string
    sha256hash: string
}

export interface IDocumentReference {
    category: string
    request_id: string
    base_name: string
    date_start: string | null
    date_end: string | null
}

export interface IElectionData {
    election_id: string
    fs: string
    committee: string
    election_method: string
    first_election_day: string
    last_election_day: string
    electoral_register_request_date: string
    electoral_register_hand_out_date: string
    result_url: string
    result_published_date: string
    scrutiny_status: string
    comments: string
}

export interface IElectionDataWithMeta extends IElectionData {
    last_modified_timestamp: string
    last_modified_by: string
}


export interface ISGliedSLine {
    nr: string
    fs: string
    subject: string
    degree: string
    m: string
}


export interface ICrmLine {
    subject: string
    subject_id: string
    degree: string
    degree_id: string
}


export interface ICrmLineWithFsId extends ICrmLine {
    fs_id: string
}


export interface ISGliedSWithCrmAssignment {
    sglieds: ISGliedSLine
    crm: ICrmLineWithFsId[]
}


export interface INeedsAssignmentInCrm {
    unassigned: ICrmLine
    fs: string
}

export interface ISGliedSStatusData {
    sglieds_with_crm_assignments: ISGliedSWithCrmAssignment[]
    in_sglieds_but_not_in_crm: ISGliedSWithCrmAssignment[]
    wrong_crm_assignments: ICrmLineWithFsId[]
    needs_assignment_in_crm: INeedsAssignmentInCrm[]
    needs_assignment_in_sglieds: ICrmLine[]
    last_run: string
}

export interface IHHPItem {
    nr: number[]
    text: string
    centValues: (number|null)[]
}
export interface IHHPSide {
    columnTitles: string[]
    items: IHHPItem[]
}

export interface IHHP {
    title: string
    financialYearTitle: string
    financialYearStart: string
    financialYearEnd: string
    financialYearStatutesLocation: string
    passedCommittee: string
    passedDate: string
    annotations: string[]
    earnings: IHHPSide
    expenses: IHHPSide
}