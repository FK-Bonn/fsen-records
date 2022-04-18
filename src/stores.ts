import {writable} from 'svelte/store';
import type {IUserWithPermissions} from "./Interfaces";

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

const lsGetString = (key: string, default_value: string = ''): string => {
    try {
        const value = localStorage.getItem(key);
        if (value === null) {
            return default_value;
        }
        return value;
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
export const token = writable(lsGetString('token'));
export const loggedInUser = writable<IUserWithPermissions|null>(null);
export const fsen = writable<string[]>([]);

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
token.subscribe(value => {
    try {
        localStorage.setItem("token", value ? value : '');
    } catch (e) {
        //pass
    }
});
