import {
    AnnotationLevel,
    IAllFsData,
    IAnnotatedDocument,
    IAnnotation,
    IData,
    IFsData,
    IFsDataResponse,
    IFullPayoutRequestData,
    INewPayoutRequestData,
    IPermission,
    IProtectedFsData,
    IProtectedFsDataResponse,
    IUserWithPermissions
} from "./Interfaces";
import type {Interval} from "./Calculator";
import {backendPrefix} from "./settings";


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
    for (let level of [AnnotationLevel.Error, AnnotationLevel.Unchecked, AnnotationLevel.Warning]) {
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
        for (let reference of document.resolvedReferences) {
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
    for (let document of documents) {
        const level = getDocumentAnnotationLevel(document, requireResolvedReference);
        if (allowedLevels.includes(level)) {
            documentsWithLevels.push(document);
        }
    }
    return documentsWithLevels;
}

export const euroCents = (value: number | undefined): string => {
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

export const copyToClipboard = (str: string) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(str);
    }
    return Promise.reject('The Clipboard API is not available.');
};

export const loadLoggedInUser = async (token: string): Promise<IUserWithPermissions | null> => {
    return fetch(backendPrefix + '/user/me', {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
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
    return fetch(backendPrefix + '/user', {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('An error occured');
            }
        })
        .then(json => {
            return new Map(Object.entries(json));
        })
        .catch(() => {
            return null
        });
}

export const createAccount = async (username: string, password: string, admin: boolean, permissions: IPermission[], token: string): Promise<{ user: IUserWithPermissions | null, message: string | null }> => {
    return fetch(backendPrefix + '/user/create',
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

export const editPermissions = async (isAdmin: boolean, username: string, admin: boolean, permissions: IPermission[], token: string): Promise<{ user: IUserWithPermissions | null, message: string | null }> => {
    if (isAdmin) {
        return editPermissionsPost(username, admin, permissions, token);
    } else {
        return editPermissionsPatch(username, permissions, token);
    }
}
export const editPermissionsPost = async (username: string, admin: boolean, permissions: IPermission[], token: string): Promise<{ user: IUserWithPermissions | null, message: string | null }> => {
    return fetch(backendPrefix + '/user/permissions',
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

export const editPermissionsPatch = async (username: string, permissions: IPermission[], token: string): Promise<{ user: IUserWithPermissions | null, message: string | null }> => {
    return fetch(backendPrefix + '/user/permissions',
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
    return fetch(backendPrefix + '/user/password/' + username,
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
    return fetch(backendPrefix + '/user/password',
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

export const createPayoutRequest = async (fs: string, semester: string, token: string): Promise<{ payoutRequest: INewPayoutRequestData | null, message: string | null }> => {
    return fetch(backendPrefix + '/payout-request/afsg/create',
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

export const editPayoutRequest = async (request_id: string, payload: any, token: string): Promise<{
    payoutRequest: IFullPayoutRequestData | null,
    message: string | null
}> => {
    return fetch(backendPrefix + '/payout-request/afsg/' + request_id,
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
            return {payoutRequest: json, message: 'AFSG-Antrag aktualisiert.'};
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

export const getUrlParameter = (key: string): string|null => {
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
    for (let proceeding of proceedings) {
        if (proceeding.filename === key) {
            return proceeding;
        }
    }
    throw new Error('No proceeding with filename "' + key + '" found.');
}

export const pojoToIData = (data: any):IData=>{
    data.studentBodies = new Map(Object.entries(data.studentBodies));
    data.payoutRequests = new Map(Object.entries(data.payoutRequests));
    for (let fsId of data.payoutRequests.keys()) {
        data.payoutRequests.set(fsId, new Map(Object.entries(data.payoutRequests.get(fsId))));
    }
    for (let studentBody of data.studentBodies.keys()) {
        const proceedings = data.studentBodies.get(studentBody).proceedings;
        for (let budget of data.studentBodies.get(studentBody).budgets) {
            budget.resolvedReferences = [];
            for (let reference of budget.references) {
                budget.resolvedReferences.push(getProceeding(proceedings, reference));
            }
        }
        for (let balances of data.studentBodies.get(studentBody).balances) {
            balances.resolvedReferences = [];
            for (let reference of balances.references) {
                balances.resolvedReferences.push(getProceeding(proceedings, reference));
            }
        }
        for (let cashAudit of data.studentBodies.get(studentBody).cashAudits) {
            cashAudit.resolvedReferences = [];
            for (let reference of cashAudit.references) {
                cashAudit.resolvedReferences.push(getProceeding(proceedings, reference));
            }
        }
    }
    return data as IData;
}

export const manglePayoutRequestData = (data: INewPayoutRequestData[]): Map<string, Map<string, INewPayoutRequestData>> => {
    const retval = new Map<string, Map<string, INewPayoutRequestData>>()
    for (let datum of data) {
        if(!retval.has(datum.fs)){
            retval.set(datum.fs, new Map<string, INewPayoutRequestData>());
        }
        retval.get(datum.fs).set(datum.semester, datum);
    }
    return retval;
}

export const getPayoutRequestData = async (fixedDate: string | null = null): Promise<Map<string, Map<string, INewPayoutRequestData>>> => {
    let url = backendPrefix + '/payout-request/afsg';
    if (fixedDate) {
        url += '/' + fixedDate;
    }
    return fetch(url)
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return manglePayoutRequestData(rawdata);
        });
};

export const getPayoutRequestHistory = async (request_id: string, token: string): Promise<IFullPayoutRequestData[]> => {
    let url = backendPrefix + `/payout-request/afsg/${request_id}/history`;
    return fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
};

export const getAllFsData = async (token: string): Promise<IAllFsData | null> => {
    if(!token){
        return null;
    }
    return fetch(backendPrefix + '/data', {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
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
export const getFsData = async (fs: string, token: string): Promise<IFsDataResponse | null> => {
    return fetch(backendPrefix + '/data/' + fs, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
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

export const putFsData = async (fs: string, data: IFsData, token: string): Promise<void> => {
    return fetch(backendPrefix + '/data/' + fs, {
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

export const getProtectedFsData = async (fs: string, token: string): Promise<IProtectedFsDataResponse | null> => {
    return fetch(backendPrefix + '/data/' + fs + '/protected', {
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

export const putProtectedFsData = async (fs: string, data: IProtectedFsData, token: string): Promise<void> => {
    return fetch(backendPrefix + '/data/' + fs + '/protected', {
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
    }
}

const collectPermissions = (permission: IPermission) => {
    const permissions = [];
    for (let prop of PERMISSIONS) {
        if (permission[prop]) {
            permissions.push(permissionToString(prop));
        }
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


export const hasFsPermission = (permissions: IPermission[], fs: string, key: keyof IPermission): boolean => {
    return permissions.filter(p => p.fs === fs && p[key]).length > 0;
}

export const getLastDayForSubmission = (interval: Interval): Date => {
    const lastDayForSubmission = new Date(interval.end);
    lastDayForSubmission.setFullYear(lastDayForSubmission.getFullYear() + 1);
    return lastDayForSubmission;
}

export const isBeforeLastDayForSubmission = (interval: Interval): boolean => {
    const today = new Date();
    return today < getLastDayForSubmission(interval);
}
