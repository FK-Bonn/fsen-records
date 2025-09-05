import type {
    IAllFsData,
    IAnnotation,
    IBaseFsData,
    IBaseFsDataHistoryEntry,
    IBaseFsDataResponse,
    IDocumentData,
    IDocumentDataForFs,
    IDocumentHistoryData,
    IDocumentReference, IElectionData, IElectionDataWithMeta,
    IElectoralRegisterDownloadData,
    IElectoralRegistersIndex,
    IElectoralRegistersStatus,
    IFullPayoutRequestData,
    IFundsDistributions,
    INewPayoutRequestData,
    IPermission,
    IPermissionKey,
    IProceedings,
    IProtectedFsData,
    IProtectedFsDataHistoryEntry,
    IProtectedFsDataResponse,
    IPublicFsData,
    IPublicFsDataHistoryEntry,
    IPublicFsDataResponse,
    IUserWithPermissions
} from "@/interfaces";
import {AnnotationLevel} from "@/interfaces";
import {Interval} from "@/Calculator";

export const PERMISSIONS: (IPermissionKey)[] = [
    'read_files',
    'read_permissions',
    'write_permissions',
    'read_public_data',
    'write_public_data',
    'read_protected_data',
    'write_protected_data',
    'submit_payout_request',
    'upload_proceedings',
    'delete_proceedings',
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

export const getDocumentAnnotationLevel = (document: IDocumentData, requireReference: boolean = false,
                                           references: IDocumentData[] = []): AnnotationLevel => {
    if (document.annotations === null) {
        return AnnotationLevel.Unchecked;
    }
    if (requireReference && references.length === 0) {
        return AnnotationLevel.Error;
    }
    const worstDocumentLevel = getWorstDocumentAnnotationLevel(document.annotations);
    const referenceLevels = [];
    if (references.length) {
        for (const reference of references) {
            let worstReferenceLevel = AnnotationLevel.Unchecked;
            if (reference.annotations !== null) {
                worstReferenceLevel = getWorstDocumentAnnotationLevel(reference.annotations);
            }
            referenceLevels.push(worstReferenceLevel);
        }
    }
    return getWorstAnnotationLevel([...referenceLevels, worstDocumentLevel]);
}

export const isReferenced = (value: IDocumentData, references: IDocumentReference[] | null): boolean => {
    if (!references) {
        return false;
    }
    for (const reference of references) {
        if (reference.category === value.category
            && reference.date_start === value.date_start
            && reference.date_end === value.date_end
            && reference.base_name === value.base_name
            && reference.request_id === value.request_id) {
            return true;
        }
    }
    return false;
}

export const isSameReference = (first: IDocumentData, second: IDocumentData): boolean => {
    return (first.category === second.category
        && first.date_start === second.date_start
        && first.date_end === second.date_end
        && first.base_name === second.base_name
        && first.request_id === second.request_id);
}

export const toReference = (document: IDocumentData): IDocumentReference => {
    return {
        category: document.category,
        request_id: document.request_id,
        base_name: document.base_name,
        date_start: document.date_start || null,
        date_end: document.date_end || null,
    }
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
    if (['ANGEWIESEN', 'GENUTZT'].includes(status)) {
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

export const getCurrentAndPastSemesters = (start: Date, count: number, mandatoryIncludes: string[]) => {
    if (count <= 0) {
        return [];
    }
    const semesters: string[] = []
    let currentYear = start.getFullYear();
    const currentMonth = start.getMonth();
    let currentType = '';
    if (currentMonth < 3) {
        currentYear = currentYear - 1;
        currentType = 'WiSe';
    } else if (currentMonth > 8) {
        currentType = 'WiSe';
    } else {
        currentType = 'SoSe';
    }
    semesters.push(`${currentYear}-${currentType}`)
    while (semesters.length < count || !mandatoryIncludes.every(value => semesters.includes(value))) {
        if (currentType === 'WiSe') {
            currentType = 'SoSe';
            semesters.push(`${currentYear}-${currentType}`)
        } else {
            currentYear = currentYear - 1;
            currentType = 'WiSe';
            semesters.push(`${currentYear}-${currentType}`)
        }
    }
    return semesters;
}

export const semesterToInterval = (semester: string) => {
    const semesterType = semester.substring(5);
    const year = parseInt(semester.substring(0, 4));
    if (semesterType === 'WiSe') {
        return new Interval(new Date(year, 9, 1), new Date(year + 1, 2, 31));
    } else {
        return new Interval(new Date(year, 3, 1), new Date(year, 8, 30));
    }
}

export const semestersToIntervals = (semesters: string[]) => {
    return semesters.map(semesterToInterval)
}

export const loadLoggedInUser = async (tokenPromise: Promise<string | null>): Promise<IUserWithPermissions | null> => {
    const token = await tokenPromise;
    if (!token) {
        console.log('token is null, not loading user')
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

export const loadUsersList = async (tokenPromise: Promise<string | null>): Promise<Map<string, IUserWithPermissions> | null> => {
    const token = await tokenPromise;
    if(!token){
        return null;
    }
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

export const createAccount = async (username: string, password: string, admin: boolean, permissions: IPermission[], tokenPromise: Promise<string | null>): Promise<{
    user: IUserWithPermissions | null,
    message: string | null
} | undefined> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
            }
        })
        .then(json => {
            return {user: json, message: 'Account erstellt.'};
        }, reason => {
            return {user: null, message: reason};
        });
}

export const editPermissions = async (isAdmin: boolean | undefined, username: string, admin: boolean, permissions: IPermission[], tokenPromise: Promise<string | null>): Promise<{
    user: IUserWithPermissions | null,
    message: string | null
} | undefined> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
            }
        })
        .then(json => {
            return {user: json, message: 'Rechte aktualisiert.'};
        }, reason => {
            return {user: null, message: reason};
        });
}

export const resetPassword = async (username: string, password: string, tokenPromise: Promise<string | null>): Promise<string> => {
    const token = await tokenPromise;
    if (!token) {
        return 'missing token';
    }
    return fetch(import.meta.env.VITE_API_URL + '/user/password/' + username,
        {
            method: 'POST', headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
            body: JSON.stringify({new_password: password})
        })
        .then(resp => {
            if (resp.ok) {
                return 'Passwort geändert.';
            } else {
                return 'Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(resp.json());
            }
        });
}

export const changePassword = async (current_password: string, new_password: string, tokenPromise: Promise<string | null>): Promise<string | undefined> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
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
                return 'Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(resp.json());
            }
        });
}

export const createPayoutRequest = async (fs: string, semester: string | undefined, tokenPromise: Promise<string | null>): Promise<{
    payoutRequest: INewPayoutRequestData | null,
    message: string | null
} | undefined> => {
    const token = await tokenPromise;
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
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
                                              tokenPromise: Promise<string | null>): Promise<{
    payoutRequest: INewPayoutRequestData | null,
    message: string | null
} | undefined> => {
    const token = await tokenPromise;
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
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
                                                         request_date: string, tokenPromise: Promise<string | null>): Promise<{
    payoutRequest: INewPayoutRequestData | null,
    message: string | null
} | undefined> => {
    const token = await tokenPromise;
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
            }
        })
        .then(json => {
            return {payoutRequest: json, message: 'Vorankündigung gestellt.'};
        }, reason => {
            return {payoutRequest: null, message: reason};
        });
}

export const editPayoutRequest = async (request_id: string, type: string, payload: any, tokenPromise: Promise<string | null>): Promise<{
    payoutRequest: IFullPayoutRequestData | null,
    message: string | null
} | undefined> => {
    const token = await tokenPromise;
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
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

export const getDocumentData = async (fixedDate: string | null = null): Promise<IDocumentDataForFs> => {
    let url = import.meta.env.VITE_API_URL + `/file/AFSG`;
    if (fixedDate) {
        url += '/' + fixedDate;
    }
    return fetch(url)
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
};

export const getDocumentHistory = async (fs: string, reference: IDocumentReference,
                                         tokenPromise: Promise<string | null>): Promise<IDocumentHistoryData[]> => {
    const token = await tokenPromise;
    const url = import.meta.env.VITE_API_URL + `/file/${fs}/history`;
    let headers: HeadersInit = {'Content-Type': 'application/json'};
    if (token) {
        headers = {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`};
    }
    return fetch(url, {
        method: 'POST', headers: headers, body: JSON.stringify(reference)
    })
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
};

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

export const getPayoutRequestHistory = async (request_id: string, type: string, tokenPromise: Promise<string | null>): Promise<IFullPayoutRequestData[] | undefined> => {
    const token = await tokenPromise;
    const headers = token ? {'Authorization': `Bearer ${token}`} : undefined;
    const url = import.meta.env.VITE_API_URL + `/payout-request/${type}/${request_id}/history`;
    return fetch(url, {method: 'GET', headers})
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return response.json().then(content => Promise.reject(content.detail))
            }
        }, () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
}

export const deletePayoutRequest = async (request_id: string, type: string, tokenPromise: Promise<string | null>): Promise<string | null> => {
    const token = await tokenPromise;
    if (!token) {
        return null;
    }
    const headers = {'Authorization': `Bearer ${token}`};
    const url = import.meta.env.VITE_API_URL + `/payout-request/${type}/${request_id}`;
    return fetch(url, {method: 'DELETE', headers})
        .then(response => {
            if (response.ok) {
                return 'Antrag gelöscht';
            } else {
                return response.json().then(content => Promise.reject(content.detail));
            }
        }, () => {
            return Promise.reject("Deleting failed");
        });
}

export const getBaseFsDataHistory = async (fs: string, tokenPromise: Promise<string | null>): Promise<IBaseFsDataHistoryEntry[] | null> => {
    const token = await tokenPromise;
    if (!token) {
        return null;
    }
    const url = import.meta.env.VITE_API_URL + `/data/${fs}/base/history`;
    return fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
};

export const getPublicFsDataHistory = async (fs: string, tokenPromise: Promise<string | null>): Promise<IPublicFsDataHistoryEntry[] | null> => {
    const token = await tokenPromise;
    if (!token) {
        return null;
    }
    const url = import.meta.env.VITE_API_URL + `/data/${fs}/public/history`;
    return fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
};

export const getProtectedFsDataHistory = async (fs: string, tokenPromise: Promise<string | null>): Promise<IProtectedFsDataHistoryEntry[] | null> => {
    const token = await tokenPromise;
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


export const approveBaseFsData = async (id: number, tokenPromise: Promise<string | null>): Promise<{
    message: string
} | null> => {
    const token = await tokenPromise;
    if (!token) {
        return null;
    }
    const url = import.meta.env.VITE_API_URL + `/data/approve/base/${id}`;
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
            }
        })
        .then(() => {
            return {message: 'Daten bestätigt.'};
        }, reason => {
            return {message: reason};
        });
}

export const approvePublicFsData = async (id: number, tokenPromise: Promise<string | null>): Promise<{
    message: string
} | null> => {
    const token = await tokenPromise;
    if (!token) {
        return null;
    }
    const url = import.meta.env.VITE_API_URL + `/data/approve/public/${id}`;
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
            }
        })
        .then(() => {
            return {message: 'Daten bestätigt.'};
        }, reason => {
            return {message: reason};
        });
}

export const approveProtectedFsData = async (id: number, tokenPromise: Promise<string | null>): Promise<{
    message: string
} | null> => {
    const token = await tokenPromise;
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
                return resp.json().then(json => Promise.reject('Ein Problem ist aufgetreten (' + resp.status + ')\n' + JSON.stringify(json)));
            }
        })
        .then(() => {
            return {message: 'Interne Daten bestätigt.'};
        }, reason => {
            return {message: reason};
        });
}

export const getAllFsData = async (tokenPromise: Promise<string | null>, fixedDate: string | null = null): Promise<IAllFsData | null> => {
    let headers = {};
    const token = await tokenPromise;
    if(token){
        headers = {'Authorization': `Bearer ${token}`};
    }
    let url = import.meta.env.VITE_API_URL + '/data';
    if (fixedDate) {
        url += '/' + fixedDate;
    }
    return fetch(url, {method: 'GET', headers: headers})
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return Promise.reject('An error occured fetching ' + url);
            }
        })
        .then(json => {
            return json;
        })
        .catch(error => {
            console.log(error);
            if (token){
                return getAllFsData(new Promise(() => null), fixedDate);
            }
        });
}

export const getBaseFsData = async (fs: string, tokenPromise: Promise<string | null>): Promise<IBaseFsDataResponse | null> => {
    const token = await tokenPromise;
    const headers: HeadersInit = token ? {'Authorization': `Bearer ${token}`} : {};
    return fetch(import.meta.env.VITE_API_URL + '/data/' + fs + '/base', {
        method: 'GET',
        headers: headers
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

export const putBaseFsData = async (fs: string, data: IBaseFsData, tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
    return fetch(import.meta.env.VITE_API_URL + '/data/' + fs + '/base', {
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

export const getPublicFsData = async (fs: string, tokenPromise: Promise<string | null>): Promise<IPublicFsDataResponse | null> => {
    const token = await tokenPromise;
    if (!token) {
        return null;
    }
    return fetch(import.meta.env.VITE_API_URL + '/data/' + fs + '/public', {
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

export const putPublicFsData = async (fs: string, data: IPublicFsData, tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
    return fetch(import.meta.env.VITE_API_URL + '/data/' + fs + '/public', {
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

export const getProtectedFsData = async (fs: string, tokenPromise: Promise<string | null>): Promise<IProtectedFsDataResponse | null> => {
    const token = await tokenPromise;
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

export const putProtectedFsData = async (fs: string, data: IProtectedFsData, tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
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

export const loadProceedingsIndex = async (): Promise<IProceedings[] | null> => {
    return fetch(import.meta.env.VITE_API_URL + '/proceedings')
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

export const loadFundsIndex = async (): Promise<IFundsDistributions | null> => {
    return fetch(import.meta.env.VITE_API_URL + '/electoral-registers/funds')
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

export const loadElectoralRegistersStatus = async (): Promise<IElectoralRegistersStatus | null> => {
    return fetch(import.meta.env.VITE_API_URL + '/electoral-registers/status')
        .then(resp => {
            return resp.json(); // HTTP Status is 500 if unhealthy, so no check for resp.ok here
        });
}

export const loadElectoralRegistersLog = async (): Promise<IElectoralRegisterDownloadData[] | null> => {
    return fetch(import.meta.env.VITE_API_URL + '/electoral-registers/log')
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

export const loadElectoralRegistersIndex = async (): Promise<IElectoralRegistersIndex | null> => {
    return fetch(import.meta.env.VITE_API_URL + '/electoral-registers')
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

export const loadElectionDatesIndex = async (): Promise<IElectionData[] | null> => {
    return fetch(import.meta.env.VITE_API_URL + '/elections/')
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

export const saveElection = async (data: IElectionData | null, tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
    if (!token || !data) {
        return;
    }
    return fetch(import.meta.env.VITE_API_URL + '/elections/save', {
        method: 'POST',
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

export const getElectionHistory = async (electionId: string, tokenPromise: Promise<string | null>): Promise<IElectionDataWithMeta[] | undefined> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
    const headers = {'Authorization': `Bearer ${token}`};
    const url = import.meta.env.VITE_API_URL + `/elections/${electionId}/history`;
    return fetch(url, {method: 'GET', headers})
        .then(response => response.json(), () => {
            return Promise.reject("Fetching data failed");
        })
        .then(rawdata => {
            return rawdata;
        });
}

export const uploadDocument = async (fs: string, file: File, category: string, base_name: string,
                                     date_start: string | null, date_end: string | null,
                                     request_id: string | null, tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
    const data = new FormData();
    data.append('file', file);
    data.append('category', category);
    data.append('base_name', base_name);
    if (date_start) {
        data.append('date_start', date_start);
    }
    if (date_end) {
        data.append('date_end', date_end);
    }
    if (request_id) {
        data.append('request_id', request_id);
    }
    return fetch(import.meta.env.VITE_API_URL + '/file/' + fs, {
        method: 'POST',
        headers: {'Authorization': `Bearer ${token}`},
        body: data
    })
        .then(resp => {
            if (resp.ok) {
                return;
            } else {
                return Promise.reject(resp.text());
            }
        });
}

export const annotateDocument = async (fs: string, target: IDocumentReference, annotations: IAnnotation[] | null,
                                       tags: string[] | null, references: IDocumentReference[] | null,
                                       url: string | null, tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
    const data = {
        target,
        annotations,
        tags,
        references,
        url,
    }
    return fetch(import.meta.env.VITE_API_URL + `/file/${fs}/annotate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(data)
    })
        .then(resp => {
            if (resp.ok) {
                return;
            } else {
                return Promise.reject(resp.text());
            }
        });
}

export const deleteDocument = async (fs: string, target: IDocumentReference, tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
    const data = {
        target,
    }
    return fetch(import.meta.env.VITE_API_URL + `/file/${fs}/delete`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify(data)
    })
        .then(resp => {
            if (resp.ok) {
                return;
            } else {
                return Promise.reject(resp.text());
            }
        });
}

export const uploadProceedings = async (fs: string, file: File, committee: string, date: string, tags: string,
                                        tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
    const data = new FormData();
    data.append('file', file);
    data.append('committee', committee);
    data.append('date', date);
    data.append('tags', tags);
    return fetch(import.meta.env.VITE_API_URL + '/proceedings/' + fs, {
        method: 'POST',
        headers: {'Authorization': `Bearer ${token}`},
        body: data
    })
        .then(resp => {
            if (resp.ok) {
                return;
            } else {
                return Promise.reject(resp.text());
            }
        });
}

export const deleteProceedings = async (fs: string, committee: string, date: string, tokenPromise: Promise<string | null>): Promise<void> => {
    const token = await tokenPromise;
    if (!token) {
        return;
    }
    return fetch(import.meta.env.VITE_API_URL + `/proceedings/${fs}/${committee}/${date}`, {
        method: 'DELETE',
        headers: {'Authorization': `Bearer ${token}`},
    })
        .then(resp => {
            if (resp.ok) {
                return;
            } else {
                return Promise.reject('An error occured');
            }
        });
}


export const transfer = async (token: string | null, kcTokenPromise: Promise<string | null>): Promise<void> => {
    const oidc_token = await kcTokenPromise;
    return fetch(import.meta.env.VITE_API_URL + '/user/transfer', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token, oidc_token}),
    })
        .then(resp => {
            if (resp.ok) {
                return;
            } else {
                return resp.json().then((json)=>Promise.reject(json.detail));
            }
        });
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
        case 'upload_proceedings':
            return '📃 Protokolle hochladen';
        case 'delete_proceedings':
            return '🚮️ Protokolle löschen';
        case 'locked':
            return '🔒 Rechte-Bearbeitung nur durch FSK';
    }
}

export const committeeToFullName = (committee: string) => {
    switch (committee) {
        case 'FSV':
            return 'Fachschaftsvertretung (FSV)';
        case 'FSR':
            return 'Fachschaftsrat (FSR)';
        case 'FSVV':
            return 'Fachschaftsvollversammlung (FSVV)';
        case 'WVV':
            return 'Wahlvollversammlung (WVV)';
        case 'WA':
            return 'Wahlausschuss (WA)';
        default:
            return committee;
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


export const hasFsPermission = (permissions: IPermission[] | undefined, fs: string, key: IPermissionKey): boolean => {
    if (!permissions) {
        return false;
    }
    return permissions.filter(p => p.fs === fs && p[key]).length > 0;
}

export const hasAnyPermission = (u: IUserWithPermissions) => {
    if (u.admin) {
        return true;
    }
    for (const permission of u.permissions) {
        if (permission.read_permissions
            || permission.write_permissions
            || permission.read_files
            || permission.read_public_data
            || permission.write_public_data
            || permission.read_protected_data
            || permission.write_protected_data
            || permission.submit_payout_request
            || permission.upload_proceedings
            || permission.delete_proceedings) {
            return true;
        }
    }
    return false;
}

export const getLastDayForSubmission = (interval: Interval): Date => {
    const lastDayForSubmission = new Date(interval.end);
    lastDayForSubmission.setFullYear(lastDayForSubmission.getFullYear() + 1);
    return lastDayForSubmission;
}

export const isBeforeOrOnLastDayForSubmission = (interval: Interval, fixedDate: string | null): boolean => {
    const yesterday = fixedDate ? new Date(fixedDate) : new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday < getLastDayForSubmission(interval);
}

export const sortPayoutRequests = (a: INewPayoutRequestData, b: INewPayoutRequestData) => {
    if (a.status > b.status) {
        return 1;
    } else if (a.status < b.status) {
        return -1;
    } else if (a.fs > b.fs) {
        return 1;
    } else if (a.fs < b.fs) {
        return -1;
    } else if (a.request_id > b.request_id) {
        return 1;
    } else if (a.request_id < b.request_id) {
        return -1;
    }
    return 0;
}

export const getUsernameFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('user') || '';
}

export const actualDateOrNull = (date: string | undefined | null) => {
    if (date) {
        try {
            const d = new Date(date);
            return d.toISOString().substring(0, 10);
        } catch (e) {
            return null;
        }
    }
    return null;
}

export const getFixedDateFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fixedDate = urlParams.get('date') || null;
    return actualDateOrNull(fixedDate);
}

export const resetFixedDateInUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete('date');
    window.location.search = urlParams.toString();
}

export const updatePageTitle = (title?: string) => {
    if (title) {
        document.title = title + ' · ' + import.meta.env.VITE_SITE_TITLE;
    } else {
        document.title = import.meta.env.VITE_SITE_TITLE;
    }
}

export const downloadFile = async (url: string, tokenPromise: Promise<string|null>) => {
    const token = await tokenPromise;
    if(!token){
        return;
    }
    return fetch(url, {method: 'GET', headers: {'Authorization': `Bearer ${token}`}})
        .then(resp => {
            if (resp.ok) {
                return resp.blob();
            } else {
                return Promise.reject('An error occured');
            }
        })
        .then(blob => {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            return Promise.resolve();
        })
        .catch(() => alert('Hoppla! Das hat leider nicht geklappt'));
}

export const jsonRepresentationIsDifferent = (first: any, second: any) => {
    return JSON.stringify(first) !== JSON.stringify(second);
}

export const shortenFilename = (filename: string | undefined): string | undefined => {
    if (!filename) {
        return;
    }
    return filename.replace(/-([0-9a-f]{8})[0-9a-f]{56}\./, '-$1….');
}


export const getFinancialYearShort = (start?: string, end?: string): string => {
    if(!start){
        return '(?)';
    }
    const yearStart = start.substring(0, 4);
    const yearEnd = end?.substring(0, 4);
    return yearStart === yearEnd ? yearStart : yearStart + '/' + yearEnd?.substring(2, 4);
}

export const getDocumentPrefix = (document: IDocumentData) => {
    if (document.base_name === 'HHP') {
        return 'Haushaltsplan ' + getFinancialYearShort(document.date_start, document.date_end);
    }
    if (document.base_name === 'NHHP1') {
        return '1. Nachtragshaushaltsplan ' + getFinancialYearShort(document.date_start, document.date_end);
    }
    if (document.base_name === 'NHHP2') {
        return '2. Nachtragshaushaltsplan ' + getFinancialYearShort(document.date_start, document.date_end);
    }
    if (document.base_name === 'NHHP3') {
        return '3. Nachtragshaushaltsplan ' + getFinancialYearShort(document.date_start, document.date_end);
    }
    if (document.base_name === 'NHHP4') {
        return '4. Nachtragshaushaltsplan ' + getFinancialYearShort(document.date_start, document.date_end);
    }
    if (document.base_name === 'NHHP5') {
        return '5. Nachtragshaushaltsplan ' + getFinancialYearShort(document.date_start, document.date_end);
    }
    if (document.base_name.startsWith('NHHP')) {
        return 'Nachtragshaushaltsplan ' + getFinancialYearShort(document.date_start, document.date_end);
    }
    if (document.base_name === 'HHR') {
        return 'Haushaltsrechnung ' + getFinancialYearShort(document.date_start, document.date_end);
    }
    if (document.base_name === 'KP') {
        return 'Kassenprüfung über den Zeitraum';
    }
    if (document.base_name === 'Wahlergebnis') {
        return 'Ergebnis der Wahl vom';
    }
    if (document.base_name === 'Prot') {
        return 'Protokoll der Sitzung vom';
    }
}

export function assertIsNode(e: EventTarget | null): asserts e is Node {
    if (!e || !("nodeType" in e)) {
        throw new Error(`Node expected`);
    }
}

export const refKey = (reference: IDocumentReference) => reference.category + '-' + reference.base_name +
    (reference.date_start ? ('-' + reference.date_start) : '') +
    (reference.date_end ? ('--' + reference.date_end) : '') +
    (reference.request_id ? ('-' + reference.request_id) : '');

export const payoutRequestToMarkdown= (payoutRequest: INewPayoutRequestData)=>{
    const paddedAmount = euroCents(payoutRequest.amount_cents).padStart(10, ' ');
    let value = `1. FS ${payoutRequest.fs} | Semester: ${payoutRequest.semester}  
 **${payoutRequest.category}** · [\`${payoutRequest.request_id}\`](${window.location.href})  
 \`${paddedAmount}\`  `;
    if (payoutRequest.comment){
        value += `
 _${payoutRequest.comment}_  `;
    }
    if (payoutRequest.reference){
        value += `
 (${payoutRequest.reference})  `;
    }
    return value;
}

export const toFinancialYear = (date: string) => {
    const year = parseInt(date.substring(0, 4));
    const month = date.substring(5, 7);
    if (month < '07') {
        return `${year - 1}/${year}`;
    }
    return `${year}/${year + 1}`;

}

export const isLocalStorageEnabled = () => {
    try {
        const key = `temp`;
        window.localStorage.setItem(key, 'test');
        window.localStorage.removeItem(key);
        return true;
    } catch (e) {
        return false;
    }
};

export const until = (predicateFunction: () => boolean) => {
    const poll = (done: (value: unknown) => void) => (predicateFunction() ? done(null) : setTimeout(() => poll(done), 10));
    return new Promise(poll);
};