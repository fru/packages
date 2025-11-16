import { it, expect } from 'vitest';

it('Template should render and update on data change', () => {
  type Test = {
    test2?: {
      array: {
        [key: string]: { i: number };
      }[];
    };
    test3?:
      | {
          test4?: boolean;
        }
      | number;
  };

  const proxy = createProxy<Test>();
  const x = proxy.test2.array[1].test.i;
  console.log(proxy.test2.array[-1.5].test.i[$path]);
});

type StateProxyPath = { [$path]: string[] };
const $path = Symbol('path');

type Primitive = string | number | boolean | bigint | null | undefined;
type ValueType = Primitive | Function;

type Keyed<T> = T extends Array<infer U> ? { [index: number]: U } : Exclude<T, ValueType>;
type Key<T> = Extract<keyof Keyed<T>, string | number>;

export type StateProxy<T> = StateProxyPath & {
  [K in Key<T>]: StateProxy<Keyed<T>[K]>;
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
