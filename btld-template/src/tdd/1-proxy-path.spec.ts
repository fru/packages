import { it, expect } from 'vitest';
import { isObjectType } from './helper';

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
});

const $path = Symbol('path');
const $root = Symbol('root');

type StateRoot = { data: unknown };

interface StateProxyApiMethods<T> {
  $path(this: StateProxyApi<any>, segments: string[]): StateProxyApi<unknown>;
  $get(this: StateProxyApi<any>): T;
  $set(this: StateProxyApi<any>, value: T): void;
  $delete(this: StateProxyApi<any>, ...keys: string[] | number[]): void;
  $move(this: StateProxyApi<any>, from: number, to: number): void;
  $append(this: StateProxyApi<any>, ...values: T[]): void;
  $listen(this: StateProxyApi<any>, listener: Listener<T>): void;
}

interface StateProxyApi<T> extends StateProxyApiMethods<T> {
  [$path]: string[];
  [$root]: StateRoot;
}

function iterateGet(path: string[], data: any, index: number = 0) {
  if (typeof data !== 'object' || data === null) return undefined;
  if (index === path.length) return data;
  return iterateGet(path, data[path[index]], index + 1);
}

function isIndex(segment: string) {
  return Number.isInteger(Number(segment)) && Number(segment) >= 0;
}

function replaceNode(segment: string, frozen: any) {
  const isArray = isIndex(segment);
  const isSameType = isArray === Array.isArray(frozen);
  if (!isSameType) return isArray ? [] : {};
  return isArray ? [...frozen] : { ...frozen };
}

// Return type: root, leaf, listener

function replaceAncestors(path: string[], frozen: any, index: number = 0) {}

const methods: StateProxyApiMethods<any> = {
  $path: function (segments) {
    return {
      [$path]: [...this[$path], ...segments],
      [$root]: this[$root],
      ...api,
    };
  },
  $get: function () {
    return iterateGet(this[$path], this[$root].data);
  },
  $set: function (value) {
    const listeners: (() => void)[] = [];

    //
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

interface Update<T> {
  prev: T;
  data: T; // type could be StateView<T> ?
  shape: string;
  indices: number[];
  //details: { } array modifications
}

type Listener<T> = (update: Update<T>) => void;

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
  const root: StateRoot = { data: undefined };
  return createProxy<T>([], root);
}
