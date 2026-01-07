/**
 * Is object or array type? Truthy check, explicitly excludes null.
 * @param value 
 * @returns boolean
 */
export const isComplexType = (v: any) => !!v && typeof v === 'object';


export const $deep_frozen = Symbol();
export const isDeepFrozen = (v: any) => !!v && v[$deep_frozen];


