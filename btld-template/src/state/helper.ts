export type Func = (...args: unknown[]) => unknown;

export function isFunc(value: unknown): value is Func {
  return typeof value === 'function';
}

export type Primitive = string | number | boolean | bigint | null | undefined;

export function isPrimitive(value: unknown): value is Primitive {
  if (value === null) return true;
  return typeof value !== 'object' && !isFunc(value);
}

export function existsOrAdd<T>(set: Set<T>, value: T): true | undefined {
  if (set.has(value)) return true;
  set.add(value);
}

export function existsOrCreate<T>(map: Map<string, T>, key: string, creator: () => T): T {
  if (!map.has(key)) map.set(key, creator());
  return map.get(key)!; 
}