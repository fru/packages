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
  x.get();
  proxy.test2.array[-1.5].test.i.get();
  proxy.test3[1].test4.get();
  proxy.test3[1].test4.set(true);
});

const $path = Symbol('path');
const $root = Symbol('root');

type StateRoot = { data: unknown };

type StateProxyApi<T> = {
  [$path]: string[];
  [$root]: StateRoot;
  get(): T;
  set(value: T): void;
  delete(...keys: string[] | number[]): void;
  move(from: number, to: number): void;
  append(...values: T[]): void;
  listen(listener: Listener<T>): void;
};

const api = Object.freeze({
  get: function (this: StateProxyApi<any>) {
    console.log('get', this[$path]);
  },
  set: function (this: StateProxyApi<any>, value: any) {
    console.log('set', this[$path], value);
  },
});

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
