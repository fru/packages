import { it, expect } from 'vitest';

it('Template should render and update on data change', () => {
  type Test = {
    test2?: {
      array: {
        test: { i: number };
        [key: string]: { i: number };
      }[];
    };
    test3?:
      | {
          test4?: boolean;
        }[]
      | number;
    test4: () => void;
    test5: Date;
  };

  const proxy = createStateRoot<Test>();
  const x = proxy.test2.array[1].test.i;
  x.$get();
  proxy.test2.array[-1.5].test.i.$get();
  proxy.test3[1].test4.$get();
  proxy.test3[1].test4.$set(true);
  //proxy.test3[0].test4.$set(false);
  console.log(proxy.$get());
});

const $path = Symbol('path');
const $root = Symbol('root');
const $data = Symbol('data');

type StateRoot = { [$data]: unknown };

interface StateProxyApiMethods<T> {
  $path(this: StateProxyApi<any>, segments: string[]): StateProxyApi<unknown>;
  $get(this: StateProxyApi<any>): T;
  $set(this: StateProxyApi<any>, value: T): void;
  $delete(this: StateProxyApi<any>, ...keys: string[] | number[]): void;
  $move(this: StateProxyApi<any>, from: number, to: number): void;
  $append(this: StateProxyApi<any>, ...values: T[]): void;
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

function cloneFreeze<T>(value: T): T {
  return JSON.parse(JSON.stringify(value), (_, v) => {
    return isObjectType(v) ? Object.freeze(v) : v;
  });
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

function buildLocation(prop: string, l: Location = { glob: '', idxs: [] }) {
  const seperator = l.glob && prop ? '.' : '';
  const glob = l.glob + seperator + (isIndex(prop) ? '*' : prop);
  const idxs = isIndex(prop) ? [...l.idxs, Number(prop)] : l.idxs;
  return { idxs, glob };
}

function iterateSet(parent: SetEvent<any>, listener: Func[], path: Path, value: any, i = 0) {
  const { root } = parent;
  const prop = i > 0 ? path[i - 1] : '';
  const prev = isObjectType(parent.prev) ? parent.prev[prop] : undefined;
  const next = i === path.length ? value : replaceNode(path[i], prev);
  console.log(prop, next);

  parent.next[prop] = next;
  Object.freeze(parent.next);

  const event = { ...buildLocation(prop, parent), root, prev, next };
  //listener.push(() => console.log(event));

  if (i === path.length) return event;
  return iterateSet(event, listener, path, value, i + 1);
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

    const root_dummy: any = { '': this[$root][$data] };
    const listeners: (() => void)[] = [];

    const event = iterateSet(
      {
        root: this[$root],
        prev: root_dummy,
        next: root_dummy,
        glob: '',
        idxs: [],
      },
      listeners,
      this[$path],
      value,
    );
    // TODO updateListener but with details
    // TODO deep iterator for data and prev to trigger listeners

    this[$root][$data] = root_dummy[''];
    listeners.forEach((listener) => listener());
  },
  $delete: function (...keys) {},
  $move: function (from, to) {},
  $append: function (...values) {},
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
  idxs: number[];
  glob: string;
}

interface SetEvent<T> extends Location {
  root: StateRoot;
  prev: T;
  next: T;
  //details: { } array modifications
}

type Func = () => void;

type Listener<T> = (update: SetEvent<T>) => void;

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
