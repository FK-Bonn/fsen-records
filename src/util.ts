import {AnnotationLevel, IAnnotatedDocument, IAnnotation, IPayoutRequestData, IUserWithPermissions} from "./Interfaces";
import type {Interval} from "./Calculator";
import {backendPrefix} from "./settings";

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

export const shouldDisplayStar = (level: AnnotationLevel, payoutRequest?: IPayoutRequestData): boolean => {
    if (!payoutRequest) {
        return false;
    }
    const completeLevels: AnnotationLevel[] = [AnnotationLevel.Ok, AnnotationLevel.Unchecked, AnnotationLevel.Warning];
    if (!completeLevels.includes(level)) {
        return false;
    }
    return ['GESTELLT', 'IN BEARBEITUNG'].includes(payoutRequest.status);
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
                Promise.reject('An error occured');
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
                Promise.reject('An error occured');
            }
        })
        .then(json => {
            return new Map(Object.entries(json));
        })
        .catch(() => {
            return null
        });
}

export const createAccount = async (username: string, password: string, admin: boolean, permissions: string[], token: string): Promise<{ user: IUserWithPermissions | null, message: string | null }> => {
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

export const editPermissions = async (username: string, admin: boolean, permissions: string[], token: string): Promise<{ user: IUserWithPermissions | null, message: string | null }> => {
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

export const resetPassword = async (username: string, password: string, token: string): Promise<string> => {
    return fetch(backendPrefix + '/user/password/'+username,
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
            } else if(resp.status === 401){
                return 'Falsches aktuelles Passwort.';
            } else {
                return 'Ein Problem ist aufgetreten (' + resp.status + ')';
            }
        });
}
