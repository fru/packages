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

  const proxy = createProxy<Test>();
  const x = proxy.test2.array[1].test.i;
  console.log(proxy.test2.array[-1.5].test.i[$path]);
  proxy.test3[1].test4;
});

type StateProxyPath = { [$path]: string[] };
const $path = Symbol('path');

type Primitive = string | number | boolean | bigint | null | undefined;
type Value = Primitive | Function;

type KeyedArray<T> = T extends Array<infer U> ? { [index: number]: U } : T;
type KeyedObject<T> = T extends Record<string | number, unknown> ? T : {};
type Keyed<T> = KeyedObject<KeyedArray<Exclude<T, Value>>>;

export type StateProxy<T> = StateProxyPath & {
  [K in Extract<keyof Keyed<T>, string | number>]: StateProxy<Keyed<T>[K]>;
};

export function createProxy<T>(path: string[] = []): StateProxy<T> {
  const traps = {
    get(_: any, prop: string | typeof $path) {
      if (prop === $path) return path;
      return createProxy<any>([...path, prop]);
    },
  };
  return <StateProxy<T>>new Proxy({}, traps);
}
