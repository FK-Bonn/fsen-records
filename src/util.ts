import {AnnotationLevel, IAnnotatedDocument, IAnnotation} from "./Interfaces";

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

export const getDocumentAnnotationLevel = (document: IAnnotatedDocument): AnnotationLevel => {
    let worstDocumentLevel = getWorstDocumentAnnotationLevel(document.annotations);
    if (!document.checked) {
        worstDocumentLevel = AnnotationLevel.Unchecked;
    }
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

export const getCheckedDocumentsWithoutIssues = (documents: IAnnotatedDocument[], requireResolvedReference = false): IAnnotatedDocument[] => {
    const withoutIssues = [];
    for (let document of documents) {
        const level = getDocumentAnnotationLevel(document);
        const isMissingReference = requireResolvedReference && document.resolvedReferences.length === 0;
        if (![AnnotationLevel.Error, AnnotationLevel.Unchecked].includes(level) && !isMissingReference) {
            withoutIssues.push(document);
        }
    }
    return withoutIssues;
}

export const getDocumentsWithoutIssues = (documents: IAnnotatedDocument[]): IAnnotatedDocument[] => {
    const withoutIssues = [];
    for (let document of documents) {
        const level = getDocumentAnnotationLevel(document);
        if (![AnnotationLevel.Error].includes(level)) {
            withoutIssues.push(document);
        }
    }
    return withoutIssues;
}