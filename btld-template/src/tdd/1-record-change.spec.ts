import { it, expect } from 'vitest';

// ## Design Assertions - Freeze State, Batch Modification, Apply, Call Listeners
// - Initial idea: frreze or have a fully internal copy
// - Initial idea: then have a proxy facade that allows and records changes
// - Problem: This would basically lead to reimplementing immer.js or structura.js
// - Problem: Sort etc. means many set and deletes, batching is required
// - Edge cases: circular references, reusing the same object
// - Solution: Change Api that allows for clear

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

interface Update {}
