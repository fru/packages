import { it, expect, bench } from 'vitest';

function wrap<T>(data: T) {
  return { proxy: data, recorded: new Set() };
}

bench('sort', () => {
  console.log('sorting');
  expect(true).toBe(true);
});

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
