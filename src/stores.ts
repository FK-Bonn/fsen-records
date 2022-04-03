import { writable } from 'svelte/store';

export const showOnlyWhoCurrentlyCanBePaid = writable(false);
export const showOnlySemestersWithPayoutRequests = writable(false);
export const showOnlySemestersWithStar = writable(false);
export const compactMode = writable(false);
export const showFilenames = writable(true);
