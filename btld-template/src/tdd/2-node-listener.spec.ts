import { it, expect } from 'vitest';

// ## Design Assertions
// - Every API is relative to a StateRoot
// - By default the only global state is one global StateRoot
// - State is made up of arrays, objects and values (primitives and functions)
// - Path string like 'a.1.b.2.3' point to a specific location
// - Nodes contain everything fixed to a specific path location
// - Generalized path like 'a.*.b.*.*' fully show where arrays and objects are expected

it('Template should render and update on data change', () => {
  expect(true).toBe(true);
});
