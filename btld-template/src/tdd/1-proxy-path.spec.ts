import { it, expect } from 'vitest';

it('Template should render and update on data change', () => {
  type Test = {
    array: { v: number }[];
  };

  const proxy = createStateRoot<any>();
  proxy.$set({
    array: [{ v: 0 }, { v: 1 }, { v: 2 }, { v: 3 }],
  });

  proxy.array[0].$set(proxy.array[1].$get());
  console.log(proxy.$get());
});

const $path = Symbol('path');
const $root = Symbol('root');
const $data = Symbol('data');
const $frozen = Symbol('frozen');

type StateRoot = { [$data]: unknown };

interface StateProxyApiMethods<T> {
  $path(this: StateProxyApi<any>, segments: string[]): StateProxyApi<unknown>;
  $get(this: StateProxyApi<any>): T;
  $set(this: StateProxyApi<any>, value: T): void;
  $listen(this: StateProxyApi<any>, listener: Listener<T>): void;
}

type Path = readonly string[];

interface StateProxyApi<T> extends StateProxyApiMethods<T> {
  [$path]: Path;
  [$root]: StateRoot;
}

export function isObjectType(value: unknown): boolean {
  return !!value && typeof value === 'object';
}

function freeze<T>(value: T): T {
  if (!isObjectType(value)) return value;
  Object.defineProperty(value, $frozen, {
    value: true,
    enumerable: false,
    writable: false,
    configurable: false,
  });
  return Object.freeze(value);
}

function cloneFreeze(value: any) {
  if (!isObjectType(value)) return value;
  if (value[$frozen]) return value;
  const result: any = Array.isArray(value) ? [] : {};
  Object.keys(value).forEach((k) => {
    result[k] = cloneFreeze(value[k]);
  });
  return freeze(result);
}

function isIndex(segment: string) {
  return segment && Number.isInteger(Number(segment)) && Number(segment) >= 0;
}

function iterateGet(path: Path, parent: any, index = 0) {
  if (path.length === index) return parent;
  if (!isObjectType(parent)) return undefined;
  return iterateGet(path, parent[path[index]], index + 1);
}

function replaceNode(prop: string, node: any) {
  const isArray = isIndex(prop);
  if (isObjectType(node) && isArray === Array.isArray(node)) {
    return isArray ? [...node] : { ...node };
  }
  return isArray ? [] : {};
}

function build(parent: Location, prop: string, prev: any = undefined, next: any = undefined) {
  const seperator = parent.glob && prop ? '.' : '';
  const glob = parent.glob + seperator + (isIndex(prop) ? '*' : prop);
  const idxs = isIndex(prop) ? [...parent.idxs, Number(prop)] : parent.idxs;
  return { root: parent.root, idxs, glob, prev, next };
}

function iterateSet(parent: Event, updates: Event[], path: Path, value: any, i = 0) {
  const prop = i > 0 ? path[i - 1] : '';
  const prev = isObjectType(parent.prev) ? parent.prev[prop] : undefined;
  const next = i === path.length ? value : replaceNode(path[i], prev);

  parent.next[prop] = next;
  Object.freeze(parent.next);

  const event = build(parent, prop, prev, next);
  updates.push(event);

  if (i < path.length) iterateSet(event, updates, path, value, i + 1);
}

function checkReorderedSetState(e: Event, k: any) {
  if (!e.next?.[k]?.[$frozen]) return false;
  console.log('!!!', e.prev, e.next?.[k]);
  if (!Array.isArray(e.prev) || !Array.isArray(e.next)) return false;
  console.log('??????');
  if (!e.prev.includes(e.next?.[k])) return false;
  console.log('??????');
  return (e.reordered = true);
}

function iterateDeepEvents(updates: Event[] = []) {
  const parent = updates.at(-1)!;
  const { prev, next } = parent;
  if (!isObjectType(prev) && !isObjectType(next)) return;
  const keys = [...Object.keys(prev ?? {}), ...Object.keys(next ?? {})];

  for (const k of new Set(keys)) {
    if (prev?.[k] === next?.[k]) continue;
    if (checkReorderedSetState(parent, k)) continue;
    updates.push(build(parent, k, prev?.[k], next?.[k]));
    iterateDeepEvents(updates);
  }

  if (updates.at(-1)! === parent) updates.pop();
}

const methods: StateProxyApiMethods<any> = {
  $path: function (segments) {
    return Object.freeze({
      [$path]: Object.freeze([...this[$path], ...segments]),
      [$root]: this[$root],
      ...api,
    });
  },
  $get: function () {
    return iterateGet(this[$path], this[$root][$data]);
  },
  $set: function (value) {
    value = cloneFreeze(value);

    const updates: Event[] = [];
    const root = this[$root];
    const dummy: any = { '': root[$data] };
    const ctx = { root, prev: dummy, next: dummy, glob: '', idxs: [] };

    iterateSet(ctx, updates, this[$path], value);
    const last = updates.at(-1)!;
    if (last.next === last.prev) return;

    const prelast = updates.at(-2)!;
    //console.log(prelast, this[$path].at(-1)!);
    //console.log(prelast?.next?.[0], prelast?.next?.[0]?.[$frozen]);
    if (!prelast || !checkReorderedSetState(prelast, this[$path].at(-1)!)) {
      iterateDeepEvents(updates);
    }

    root[$data] = dummy[''];
    updates.forEach((event) => console.log(event.glob, ...event.idxs, event.prev, event.next, event.reordered));
  },
  $listen: function (listener) {},
};

const api = Object.freeze(methods);

type Primitive = string | number | boolean | bigint | null | undefined;
type Value = Primitive | Function;

type KeyedArray<T> = T extends Array<infer U> ? { [index: number]: U } : T;
type KeyedObject<T> = T extends Record<string | number, unknown> ? T : {};
type Keyed<T> = KeyedObject<KeyedArray<Exclude<T, Value>>>;

export type StateProxy<T> = StateProxyApi<T> & {
  [K in Extract<keyof Keyed<T>, string | number>]: StateProxy<Keyed<T>[K]>;
};

interface Location {
  root: StateRoot;
  idxs: number[];
  glob: string;
}

interface Event<T = any> extends Location {
  prev: T;
  next: T;
  reordered?: true;
  //details: { } array modifications
}

type Func = () => void;

type Listener<T> = (update: Event<T>) => void;

export function createProxy<T>(path: string[], root: StateRoot): StateProxy<T> {
  const traps = {
    get(target: any, prop: string | typeof $path | typeof $root) {
      if (prop === $path) return path;
      if (prop === $root) return root;
      if (target[prop]) return target[prop];
      return createProxy<any>([...path, prop], root);
    },
  };
  return <StateProxy<T>>new Proxy(api, traps);
}

export function createStateRoot<T>(): StateProxy<T> {
  const root: StateRoot = { [$data]: undefined };
  return createProxy<T>([], root);
}
