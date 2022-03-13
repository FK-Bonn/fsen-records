import {AnnotationLevel, IAnnotatedDocument} from "./Interfaces";

export const stringToDate = (input: string) => {
    const output = new Date(input);
    output.setHours(0);
    output.setMinutes(0);
    output.setSeconds(0);
    output.setMilliseconds(0);
    return output;
}

export const getDocumentsWithoutIssues = (documents: IAnnotatedDocument[]): IAnnotatedDocument[] => {
    const withoutIssues = [];
    for (let document of documents) {
        if(!document.checked){
            withoutIssues.push(document);
            continue;
        }
        let include = true;
        for (let annotation of document.annotations) {
            if(annotation.level == AnnotationLevel.Error){
                include = false;
                break;
            }
        }
        for (let reference of document.resolvedReferences) {
            if(reference.filename.startsWith('Prot-')){
                if(!reference.checked){
                    include = false;
                    break;
                }
                for (let annotation of reference.annotations) {
                    if(annotation.level == AnnotationLevel.Error){
                        include = false;
                        break;
                    }
                }
            }
        }
        if(include){
            withoutIssues.push(document);
        }
    }
    return withoutIssues;
}