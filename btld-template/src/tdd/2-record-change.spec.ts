import { it, expect } from 'vitest';

it('Template should render and update on data change', () => {
  var { proxy, recorded } = wrap({
    test: {
      test2: {
        array: [{ i: 2 }, { i: 1 }, { i: 0 }],
      },
    },
  });

  proxy.test.test2.array.sort((a, b) => a.i - b.i);
  var i1 = proxy.test.test2.array.find((a) => a.i === 1);
  (<any>i1).other = true;
  (<any>proxy.test).test3 = undefined;
  (<any>proxy.test).test3 = { test4: true };

  expect(true).toBe(true);
});

function wrap<T>(data: T) {
  return { proxy: data, recorded: new Set() };
}

interface Update<T> {
  prev: T;
  data: T; // type could be StateView<T> ?
  shape: string;
  indices: number[];
  //details: { } array modifications
}

type Listener<T> = (update: Update<T>) => void;

abstract class AbstractStateView<T = any, U = any> {
  abstract readonly _root: StateRoot<T>;
  abstract readonly _segements: string[];

  path<V = any>(...segements: string[]): StateView<T, V> {
    return new StateView(this._root, this._segements.concat(segements));
  }

  get() {
    return undefined as U;
  }

  set(value: U) {}
  delete(...keys: string[] | number[]) {}
  move(from: number, to: number) {}
  append(...values: U[]) {}
  listen(listener: Listener<U>) {}
}

class StateView<T = any, U = any> extends AbstractStateView<T, U> {
  constructor(
    public readonly _root: StateRoot<T>,
    public readonly _segements: string[],
  ) {
    super();
  }
}

class StateRoot<T = any> extends AbstractStateView<T, T> {
  _root = this;
  _segements = [];
  _data: T | undefined;
}
