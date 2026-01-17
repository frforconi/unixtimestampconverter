import { atom } from 'nanostores';

export const realtimeTimestamp = atom(Math.floor(Date.now() / 1000));
export const referenceTimestamp = atom(Math.floor(Date.now() / 1000));
