import {AnnotationLevel, IAnnotatedDocument, IAnnotation, IPayoutRequestData} from "./Interfaces";
import type {Interval} from "./Calculator";

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

export const euro = (value: number): string => {
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
    const completeLevels: AnnotationLevel[] = [AnnotationLevel.Ok, AnnotationLevel.Unchecked];
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
