import { writable } from 'svelte/store'

//Shared across acts where Act 2 sets it, Act 3's paradox detector 
// and Act 4's metric comparison will both read from it later. So the
//readers chosen "imbalance level" stays consistent as they scroll through the 
//story instead of resetting per act

export const imbalance = writable(0.5);
export const totalImpressions = writable(6000);
