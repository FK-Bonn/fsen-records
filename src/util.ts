import type {
    IAllFsData,
    IAnnotatedDocument,
    IAnnotation, IData, IFsData, IFsDataResponse, IFullPayoutRequestData,
    INewPayoutRequestData,
    IPermission, IProtectedFsData, IProtectedFsDataHistoryEntry, IProtectedFsDataResponse,
    IUserWithPermissions
} from "@/interfaces";
import {AnnotationLevel} from "@/interfaces";
import type {Interval} from "@/Calculator";

export const PERMISSIONS: (keyof IPermission)[] = [
    'read_files' as keyof IPermission,
    'read_permissions' as keyof IPermission,
    'write_permissions' as keyof IPermission,
    'read_public_data' as keyof IPermission,
    'write_public_data' as keyof IPermission,
    'read_protected_data' as keyof IPermission,
    'write_protected_data' as keyof IPermission,
    'submit_payout_request' as keyof IPermission,
]

export const stringToDate = (input: string) => {
    const output = new Date(input);
    output.setHours(0);
    output.setMinutes(0);
    output.setSeconds(0);
    output.setMilliseconds(0);
    return output;
}

export const getWorstDocumentAnnotationLevel = (annotations: IAnnotation[]): AnnotationLevel => {
    const levels = annotations.map(annotation => annotation.level);
    return getWorstAnnotationLevel(levels);
}

export const getWorstAnnotationLevel = (levels: AnnotationLevel[]): AnnotationLevel => {
    for (const level of [AnnotationLevel.Error, AnnotationLevel.Unchecked, AnnotationLevel.Warning]) {
        if (levels.some(value => value === level)) {
            return level
        }
    }
    return AnnotationLevel.Ok;
}

export const getDocumentAnnotationLevel = (document: IAnnotatedDocument, requireResolvedReference: boolean = false): AnnotationLevel => {
    if (!document.checked) {
        return AnnotationLevel.Unchecked;
    }
    if (requireResolvedReference && (!document.resolvedReferences || document.resolvedReferences.length === 0)) {
        return AnnotationLevel.Error;
    }
    const worstDocumentLevel = getWorstDocumentAnnotationLevel(document.annotations);
    const referenceLevels = [];
    if (document.resolvedReferences) {
        for (const reference of document.resolvedReferences) {
            let worstReferenceLevel = getWorstDocumentAnnotationLevel(reference.annotations);
            if (!reference.checked) {
                worstReferenceLevel = AnnotationLevel.Unchecked;
            }
            referenceLevels.push(worstReferenceLevel);
        }
    }
    return getWorstAnnotationLevel([...referenceLevels, worstDocumentLevel]);
}

export const getDocumentsWithLevels = (documents: IAnnotatedDocument[], allowedLevels: AnnotationLevel[], requireResolvedReference = false): IAnnotatedDocument[] => {
    const documentsWithLevels = [];
    for (const document of documents) {
        const level = getDocumentAnnotationLevel(document, requireResolvedReference);
        if (allowedLevels.includes(level)) {
            documentsWithLevels.push(document);
        }
    }
    return documentsWithLevels;
}

export const euroCents = (value: number | undefined): string => {
    if (value === undefined) {
        return '';
    }
    return euro(value / 100);
}
export const euro = (value: number | undefined): string => {
    if (!value) {
        value = 0;
    }
    const formatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
    });

    return formatter.format(value);
}

export const shouldDisplayStar = (level: AnnotationLevel, payoutRequest?: INewPayoutRequestData): boolean => {
    if (!payoutRequest) {
        return false;
    }
    const completeLevels: AnnotationLevel[] = [AnnotationLevel.Ok, AnnotationLevel.Unchecked, AnnotationLevel.Warning];
    if (!completeLevels.includes(level)) {
        return false;
    }
    return ['EINGEREICHT', 'GESTELLT'].includes(payoutRequest.status);
}


export const calculateSemesterName = (interval?: Interval) => {
    if (!interval) {
        return '?';
    }
    if (interval.start.getFullYear() === interval.end.getFullYear()) {
        return 'Sommersemester ' + interval.start.getFullYear();
    } else {
        return 'Wintersemester ' + interval.start.getFullYear() + '/' + interval.end.getFullYear().toString().substring(2, 4);
    }
}

export const calculateSemesterId = (interval?: Interval) => {
    if (!interval) {
        return undefined;
    }
    if (interval.start.getFullYear() === interval.end.getFullYear()) {
        return '' + interval.start.getFullYear() + '-SoSe';
    } else {
        return '' + interval.start.getFullYear() + '-WiSe';
    }
}

export const getStatusTagClass = (payoutRequest: INewPayoutRequestData | IFullPayoutRequestData | null): string => {
    if (!payoutRequest) {
        return '';
    }
    const status = payoutRequest.status;
    const type = payoutRequest.type;
    if (['ÜBERWIESEN', 'ANGEWIESEN', 'GENUTZT'].includes(status)) {
        return 'is-light';
    }
    if (status === 'VOLLSTÄNDIG') {
        return type === 'afsg' ? 'is-success' : 'is-info';
    }
    if (status === 'ANGENOMMEN') {
        return 'is-success';
    }
    if (status === 'GESTELLT') {
        return 'is-dark';
    }
    if (status === 'EINGEREICHT') {
        return 'is-info';
    }
    if (status === 'VORGESTELLT') {
        return 'is-warning';
    }
    return 'is-danger';
}

export const copyToClipboard = (str: string) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(str);
    }
    return Promise.reject('The Clipboard API is not available.');
};

export const loadLoggedInUser = async (token: string | null): Promise<IUserWithPermissions | null> => {
    if (!token) {
        return null;
    }
    return fetch(import.meta.env.VITE_API_URL + '/user/me', {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('An error occured');
            }
        })
        .then(json => {
            return json;
        })
        .catch(() => {
            return null
        });
}

export const loadUsersList = async (token: string): Promise<Map<string, IUserWithPermissions> | null> => {
    return fetch(import.meta.env.VITE_API_URL + '/user', {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('An error occured');
            }
        })
        .then(json => {
            return new Map(Object.entries(json)) as Map<string, IUserWithPermissions>;
        })
        .catch(() => {
            return null
        });
}

export const createAccount = async (username: string, password: string, admin: boolean, permissions: IPermission[], token: string): Promise<{
    user: IUserWithPermissions | null,
    message: string | null
}> => {
    return fetch(import.meta.env.VITE_API_URL + '/user/create',
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({username, password, admin, permissions})
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else if (resp.status == 409) {
                return Promise.reject('Account existiert bereits.');
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {user: json, message: 'Account erstellt.'};
        }, reason => {
            return {user: null, message: reason};
        });
}

export const editPermissions = async (isAdmin: boolean, username: string, admin: boolean, permissions: IPermission[], token: string): Promise<{
    user: IUserWithPermissions | null,
    message: string | null
}> => {
    if (isAdmin) {
        return editPermissionsPost(username, admin, permissions, token);
    } else {
        return editPermissionsPatch(username, permissions, token);
    }
}
export const editPermissionsPost = async (username: string, admin: boolean, permissions: IPermission[], token: string): Promise<{
    user: IUserWithPermissions | null,
    message: string | null
}> => {
    return fetch(import.meta.env.VITE_API_URL + '/user/permissions',
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({username, admin, permissions})
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {user: json, message: 'Rechte aktualisiert.'};
        }, reason => {
            return {user: null, message: reason};
        });
}

export const editPermissionsPatch = async (username: string, permissions: IPermission[], token: string): Promise<{
    user: IUserWithPermissions | null,
    message: string | null
}> => {
    return fetch(import.meta.env.VITE_API_URL + '/user/permissions',
        {
            method: 'PATCH', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({username, permissions})
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {user: json, message: 'Rechte aktualisiert.'};
        }, reason => {
            return {user: null, message: reason};
        });
}

export const resetPassword = async (username: string, password: string, token: string): Promise<string> => {
    return fetch(import.meta.env.VITE_API_URL + '/user/password/' + username,
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({new_password: password})
        })
        .then(resp => {
            if (resp.ok) {
                return 'Passwort geändert.';
            } else {
                return 'Ein Problem ist aufgetreten (' + resp.status + ')';
            }
        });
}

export const changePassword = async (current_password: string, new_password: string, token: string): Promise<string> => {
    return fetch(import.meta.env.VITE_API_URL + '/user/password',
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({current_password, new_password})
        })
        .then(resp => {
            if (resp.ok) {
                return 'Passwort geändert.';
            } else if (resp.status === 401) {
                return 'Falsches aktuelles Passwort.';
            } else {
                return 'Ein Problem ist aufgetreten (' + resp.status + ')';
            }
        });
}

export const createPayoutRequest = async (fs: string, semester: string | undefined, token: string | null): Promise<{
    payoutRequest: INewPayoutRequestData | null,
    message: string | null
} | undefined> => {
    if (!token || !semester) {
        return;
    }
    return fetch(import.meta.env.VITE_API_URL + '/payout-request/afsg/create',
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({fs, semester})
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {payoutRequest: json, message: 'AFSG-Antrag gestellt.'};
        }, reason => {
            return {payoutRequest: null, message: reason};
        });
}

export const createBfsgPayoutRequest = async (fs: string, semester: string, category: string, amount_cents: number,
                                              status: string, status_date: string, comment: string,
                                              completion_deadline: string, reference: string, request_date: string,
                                              token: string | null): Promise<{
    payoutRequest: INewPayoutRequestData | null,
    message: string | null
} | undefined> => {
    if (!token) {
        return;
    }
    const body: any = {fs, semester, category, amount_cents};
    if (status) {
        body.status = status;
    }
    if (status_date) {
        body.status_date = status_date;
    }
    if (comment) {
        body.comment = comment;
    }
    if (completion_deadline) {
        body.completion_deadline = completion_deadline;
    }
    if (reference) {
        body.reference = reference;
    }
    if (request_date) {
        body.request_date = request_date;
    }
    return fetch(import.meta.env.VITE_API_URL + '/payout-request/bfsg/create',
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(body)
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {payoutRequest: json, message: 'BFSG-Antrag gestellt.'};
        }, reason => {
            return {payoutRequest: null, message: reason};
        });
}


export const createVorankuendigungPayoutRequest = async (fs: string, semester: string, category: string,
                                                         amount_cents: number, status: string, status_date: string,
                                                         comment: string, completion_deadline: string, reference: string,
                                                         request_date: string, token: string | null): Promise<{
    payoutRequest: INewPayoutRequestData | null,
    message: string | null
} | undefined> => {
    if (!token) {
        return;
    }
    const body: any = {fs, semester, category, amount_cents};
    if (status) {
        body.status = status;
    }
    if (status_date) {
        body.status_date = status_date;
    }
    if (comment) {
        body.comment = comment;
    }
    if (completion_deadline) {
        body.completion_deadline = completion_deadline;
    }
    if (reference) {
        body.reference = reference;
    }
    if (request_date) {
        body.request_date = request_date;
    }
    return fetch(import.meta.env.VITE_API_URL + '/payout-request/vorankuendigung/create',
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(body)
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {payoutRequest: json, message: 'Vorankündigung gestellt.'};
        }, reason => {
            return {payoutRequest: null, message: reason};
        });
}

export const editPayoutRequest = async (request_id: string, type: string, payload: any, token: string | null): Promise<{
    payoutRequest: IFullPayoutRequestData | null,
    message: string | null
} | undefined> => {
    if (!token) {
        return;
    }
    return fetch(import.meta.env.VITE_API_URL + `/payout-request/${type}/` + request_id,
        {
            method: 'PATCH', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify(payload)
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {payoutRequest: json, message: `${type.toUpperCase()}-Antrag aktualisiert.`};
        }, reason => {
            return {payoutRequest: null, message: reason};
        });
}

const formatDateOptions: Intl.DateTimeFormatOptions = {year: 'numeric', month: '2-digit', day: '2-digit'};
export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-DE', formatDateOptions);
}

export const formatIsoDate = (date: Date): string => {
    return date.toISOString().substring(0, 10);
}

export const getUrlParameter = (key: string): string | null => {
    const url = new URL(window.location.toString());
    return url.searchParams.get(key);
}

export const setUrlParameter = (key: string, value: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
}

export const scrollToHashIfPresent = () => {
    if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView();
        }
    }
}

const getProceeding = (proceedings: IAnnotatedDocument[], key: string): IAnnotatedDocument => {
    for (const proceeding of proceedings) {
        if (proceeding.filename === key) {
            return proceeding;
        }
    }
    throw new Error('No proceeding with filename "' + key + '" found.');
}

export const pojoToIData = (data: any): IData => {
    data.studentBodies = new Map(Object.entries(data.studentBodies));
    data.payoutRequests = new Map(Object.entries(data.payoutRequests));
    for (const fsId of data.payoutRequests.keys()) {
        data.payoutRequests.set(fsId, new Map(Object.entries(data.payoutRequests.get(fsId))));
    }
    for (const studentBody of data.studentBodies.keys()) {
        const proceedings = data.studentBodies.get(studentBody).proceedings;
        for (const budget of data.studentBodies.get(studentBody).budgets) {
            budget.resolvedReferences = [];
            for (const reference of budget.references) {
                budget.resolvedReferences.push(getProceeding(proceedings, reference));
            }
        }
        for (const balances of data.studentBodies.get(studentBody).balances) {
            balances.resolvedReferences = [];
            for (const reference of balances.references) {
                balances.resolvedReferences.push(getProceeding(proceedings, reference));
            }
        }
        for (const cashAudit of data.studentBodies.get(studentBody).cashAudits) {
            cashAudit.resolvedReferences = [];
            for (const reference of cashAudit.references) {
                cashAudit.resolvedReferences.push(getProceeding(proceedings, reference));
            }
        }
    }
    return data as IData;
}

export const mangleBfsgPayoutRequestData = (data: INewPayoutRequestData[]): Map<string, INewPayoutRequestData[]> => {
    const retval = new Map<string, INewPayoutRequestData[]>()
    for (const datum of data) {
        if (!retval.has(datum.fs)) {
            retval.set(datum.fs, []);
        }
        retval.get(datum.fs)?.push(datum);
    }
    return retval;
}

export const getPayoutRequestData = async (type: string, fixedDate: string | null = null): Promise<Map<string, INewPayoutRequestData[]>> => {
    let url = import.meta.env.VITE_API_URL + `/payout-request/${type}`;
    if (fixedDate) {
        url += '/' + fixedDate;
    }
    return fetch(url)
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return mangleBfsgPayoutRequestData(rawdata);
        });
};

export const getPayoutRequestHistory = async (request_id: string, type: string, token: string | null): Promise<IFullPayoutRequestData[] | undefined> => {
    if (!token) {
        return;
    }
    const url = import.meta.env.VITE_API_URL + `/payout-request/${type}/${request_id}/history`;
    return fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
}

export const getFsDataHistory = async (fs: string, token: string | null): Promise<IFsData[] | null> => {
    if (!token) {
        return null;
    }
    const url = import.meta.env.VITE_API_URL + `/data/${fs}/history`;
    return fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
};

export const getProtectedFsDataHistory = async (fs: string, token: string | null): Promise<IProtectedFsDataHistoryEntry[] | null> => {
    if (!token) {
        return null;
    }
    const url = import.meta.env.VITE_API_URL + `/data/${fs}/protected/history`;
    return fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
};


export const approveFsData = async (id: number, token: string | null): Promise<{ message: string } | null> => {
    if (!token) {
        return null;
    }
    const url = import.meta.env.VITE_API_URL + `/data/approve/${id}`;
    return fetch(url,
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else if (resp.status == 404) {
                return Promise.reject(`Daten mit ID ${id} existieren nicht.`);
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {message: 'Daten bestätigt.'};
        }, reason => {
            return {message: reason};
        });
}

export const approveProtectedFsData = async (id: number, token: string | null): Promise<{ message: string } | null> => {
    if (!token) {
        return null;
    }
    const url = import.meta.env.VITE_API_URL + `/data/approve/protected/${id}`;
    return fetch(url,
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else if (resp.status == 404) {
                return Promise.reject(`Daten mit ID ${id} existieren nicht.`);
            } else {
                return Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')');
            }
        })
        .then(json => {
            return {message: 'Interne Daten bestätigt.'};
        }, reason => {
            return {message: reason};
        });
}

export const getAllFsData = async (token: string | null): Promise<IAllFsData | null> => {
    if (!token) {
        return null;
    }
    return fetch(import.meta.env.VITE_API_URL + '/data', {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('An error occured');
            }
        })
        .then(json => {
            return json;
        });
}
export const getFsData = async (fs: string, token: string | null): Promise<IFsDataResponse | null> => {
    if (!token) {
        return null;
    }
    return fetch(import.meta.env.VITE_API_URL + '/data/' + fs, {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('An error occured');
            }
        })
        .then(json => {
            return json;
        })
        .catch(() => {
            return null
        });
}

export const putFsData = async (fs: string, data: IFsData, token: string | null): Promise<void> => {
    if (!token) {
        return;
    }
    return fetch(import.meta.env.VITE_API_URL + '/data/' + fs, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(data)
    })
        .then(resp => {
            if (resp.ok) {
                return;
            } else {
                return Promise.reject('An error occured');
            }
        });
}

export const getProtectedFsData = async (fs: string, token: string | null): Promise<IProtectedFsDataResponse | null> => {
    if (!token) {
        return null;
    }
    return fetch(import.meta.env.VITE_API_URL + '/data/' + fs + '/protected', {
        method: 'GET',
        headers: {'Authorization': `Bearer ${token}`}
    })
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('An error occured');
            }
        })
        .then(json => {
            return json;
        });
}

export const putProtectedFsData = async (fs: string, data: IProtectedFsData, token: string | null): Promise<void> => {
    if (!token) {
        return;
    }
    return fetch(import.meta.env.VITE_API_URL + '/data/' + fs + '/protected', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(data)
    })
        .then(resp => {
            if (resp.ok) {
                return;
            } else {
                return Promise.reject('An error occured');
            }
        });
}

export const permissionLevelToString = (level: number) => {
    let levelString = '???';
    switch (level) {
        case 0:
            levelString = '–';
            break;
        case 1:
            levelString = '👀';
            break;
        case 2:
            levelString = '✏️';
            break;
    }
    return levelString;
}

export const permissionToString = (key: keyof IPermission) => {
    switch (key) {
        case 'read_files':
            return '👀 Dateien anzeigen';
        case 'read_permissions':
            return '👀 Berechtigungen anzeigen';
        case 'write_permissions':
            return '✏️ Berechtigungen ändern';
        case 'read_public_data':
            return '👀 FS-Daten anzeigen';
        case 'write_public_data':
            return '✏️ FS-Daten ändern';
        case 'read_protected_data':
            return '👀 geschützte FS-Daten anzeigen';
        case 'write_protected_data':
            return '️✏️ geschützte FS-Daten ändern';
        case 'submit_payout_request':
            return '️✏️ Anträge stellen';
        case 'locked':
            return '🔒 Rechte-Bearbeitung nur durch FSK';
    }
}

const collectPermissions = (permission: IPermission) => {
    const permissions = [];
    for (const prop of PERMISSIONS) {
        if (permission[prop]) {
            permissions.push(permissionToString(prop));
        }
    }
    if (permission.locked) {
        permissions.push(permissionToString('locked'));
    }
    return permissions;
}

export const permissionsToString = (permission: IPermission) => {
    const permissions = collectPermissions(permission);
    return `${permission.fs} (${permissions.join(', ')})`;
}

export const hasAnyFsPermission = (permissions: IPermission[], fs: string): boolean => {
    return permissions.filter(p => p.fs === fs).length > 0;
}


export const hasFsPermission = (permissions: IPermission[] | undefined, fs: string, key: keyof IPermission): boolean => {
    if (!permissions) {
        return false;
    }
    return permissions.filter(p => p.fs === fs && p[key]).length > 0;
}

export const getLastDayForSubmission = (interval: Interval): Date => {
    const lastDayForSubmission = new Date(interval.end);
    lastDayForSubmission.setFullYear(lastDayForSubmission.getFullYear() + 1);
    return lastDayForSubmission;
}

export const isBeforeOrOnLastDayForSubmission = (interval: Interval): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday < getLastDayForSubmission(interval);
}

