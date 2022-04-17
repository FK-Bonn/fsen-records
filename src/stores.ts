import {writable} from 'svelte/store';

const lsGetBool = (key: string, default_value: boolean = false): boolean => {
    try {
        const value = localStorage.getItem(key);
        if (value === null) {
            return default_value;
        }
        return value === 'true';
    } catch (e) {
        return default_value;
    }
}

const lsSetBool = (key: string, value: boolean) => {
    try {
        localStorage.setItem(key, value ? 'true' : 'false');
    } catch (e) {
        //pass
    }
}

export const showOnlyWhoCurrentlyCanBePaid = writable(lsGetBool('showOnlyWhoCurrentlyCanBePaid'));
export const showOnlySemestersWithPayoutRequests = writable(lsGetBool('showOnlySemestersWithPayoutRequests'));
export const showOnlySemestersWithStar = writable(lsGetBool('showOnlySemestersWithStar'));
export const compactMode = writable(lsGetBool('compactMode'));
export const showFilenames = writable(lsGetBool('showFilenames', true));

showOnlyWhoCurrentlyCanBePaid.subscribe(value => {
    lsSetBool("showOnlyWhoCurrentlyCanBePaid", value);
});
showOnlySemestersWithPayoutRequests.subscribe(value => {
    lsSetBool("showOnlySemestersWithPayoutRequests", value);
});
showOnlySemestersWithStar.subscribe(value => {
    lsSetBool("showOnlySemestersWithStar", value);
});
compactMode.subscribe(value => {
    lsSetBool("compactMode", value);
});
showFilenames.subscribe(value => {
    lsSetBool("showFilenames", value);
});
