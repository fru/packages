export type Func = (...args: unknown[]) => unknown;

export function isFunc(value: unknown): value is Func {
  return typeof value === 'function';
}

export type Primitive = string | number | boolean | bigint | null | undefined;

export function isPrimitive(value: unknown): value is Primitive {
  if (value === null) return true;
  return typeof value !== 'object' && !isFunc(value);
}

export function isObjectType(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

// guard - familiar - remembered - previouslySeen
export function existsOrAdd<T>(set: Set<T>, value: T): true | undefined {
  if (set.has(value)) return true;
  set.add(value);
}

export function cache<K extends object, V>(map: WeakMap<K, V>): (key: K, creator: () => V) => V;
export function cache<K, V>(map: Map<K, V>): (key: K, creator: () => V) => V;

export function cache(map: WeakMap<object, any> | Map<any, any>) {
  return (key: any, creator: () => any) => {
    if (!map.has(key)) map.set(key, creator());
    return map.get(key)!;
  };
}
