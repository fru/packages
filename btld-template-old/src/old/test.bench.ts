import { bench, expect } from 'vitest';

bench('noop', () => {
  console.log('sorting');
  expect(true).toBe(true);
});
