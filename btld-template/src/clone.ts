import { isComplexType, $deep_frozen } from "./helper";

/**
 * Recursively clones and freezes value. Identical to JSON.parse(JSON.stringify(val)). Circular references are strictly forbidden.
 * @param d - Maximum recursion depth (Default: 7000). Optimized for Safari/iOS stack limits.
 * Source: https://stackoverflow.com/questions/7826992/browser-javascript-stack-size-limit
 * @throws {Error}
 * The recursion depth is exceeded. This almost always indicates a **Circular Reference**. While hitting the depth limit incurs a 
 * synchronous delay (~ms), this is irrelevant as it signifies a broken implementation that requires code repair, not runtime recovery.
 */
export function cloneAsDeepFrozen(val: any, d = 7000): any {
  if (d < 0) throw new Error('Depth limit reached, likely due to circular reference.');

  if (typeof val === 'number' && !Number.isFinite(val)) return null;
  if (typeof val === 'function' || typeof val === 'bigint' || typeof val === 'symbol') return undefined;

  if (!isComplexType(val) || val[$deep_frozen]) return val;
  if (val instanceof Date) return val.toISOString();
  if (val instanceof String || val instanceof Number || val instanceof Boolean) return val.valueOf();

  const res: any = Array.isArray(val) ? [] : {};
  Object.defineProperty(res, $deep_frozen, { value: true, enumerable: false });

  if (Array.isArray(val)) {
    // Needed to ensure spares arrays like [1,,3] have empty slot filled with null
    for (let i = 0; i < val.length; i++) {
      res[i] = cloneAsDeepFrozen(val[i], d - 1) ?? null;
    }
  } else {
    for (const k of Object.keys(val)) {
      const clone = cloneAsDeepFrozen(val[k], d - 1);
      if (clone !== undefined) res[k] = clone;
    }
  }

  return Object.freeze(res);
}