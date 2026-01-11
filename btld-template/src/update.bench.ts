import { bench, describe } from 'vitest';
import { update } from './update';
import { Root } from './helper';

describe('update benchmarks', () => {
  const prev = buildTreeObject(3, 10);
  const next = JSON.parse(JSON.stringify(prev));

  // Modify some values to ensure diffing happens
  if (next.key0 && next.key0.key0) next.key0.key0.key0 = 'changed';
  if (next.key9 && next.key9.key9) next.key9.key9.key9 = 'changed';

  bench('full update function', () => {
    const root: Root = {
      value: prev,
      hooks: undefined,
    };
    update(root, [], next);
  });
});

describe('snippet benchmark', () => {
  const prev = buildFlatArray(0, 150, 0);
  const next = buildFlatArray(50, 200, 1);
  let total = 0;

  bench('keys spread and set', () => {
    const keys = [...Object.keys(prev ?? {}), ...Object.keys(next ?? {})];
    for (const k of new Set(keys)) {
      total++;
    }
    if (total === 0) throw 'Used to stop aggressive optimizations';
  });

  bench('Limit set', () => {
    const remaining = new Set(Object.keys(prev ?? {}));
    for (const k of Object.keys(next ?? {})) {
      remaining.delete(k);
      total++;
    }
    for (const k of remaining) total++;
    if (total === 0) throw 'Used to stop aggressive optimizations';
  });
});

// CREATE DUMMY DATA:

function buildFlatArray(start: number, end: number, value_add: number) {
  const arr: any[] = [];
  for (let i = start; i < end; i++) {
    arr[i] = i + value_add;
  }
  return arr;
}

function buildFlatObject(start: number, end: number, value_add: number) {
  const obj: any = {};
  for (let i = start; i < end; i++) {
    obj[`key${i}`] = i + value_add;
  }
  return obj;
}

function buildTreeObject(depth: number, breadth: number) {
  if (depth === 0) return 'leaf';
  const obj: any = {};
  for (let i = 0; i < breadth; i++) {
    obj[`key${i}`] = buildTreeObject(depth - 1, breadth);
  }
  return obj;
}
