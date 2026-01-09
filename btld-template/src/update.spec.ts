import { describe, it, expect, vi } from 'vitest';
import { update } from './update';
import { $listener, Root } from './helper';

// Setup: A factory for creating a consistent state tree with spies attached
// to key lifecycle points.
const setup = (initialValue: any = {}) => {
  const spies = {
    root: vi.fn(),
    branch: vi.fn(), // Listeners on intermediate nodes
    leaf: vi.fn(),
    wildcard: vi.fn(), // Listeners on array indices ('*')
  };

  const hooks = {
    [$listener]: [spies.root],
    scope: {
      [$listener]: [spies.branch],
      target: {
        [$listener]: [spies.leaf],
      },
    },
    list: {
      [$listener]: [],
      '*': { [$listener]: [spies.wildcard] },
    },
  };

  const root: Root = { value: initialValue, hooks: hooks as any };
  return { root: root as any, spies };
};

describe('update()', () => {
  describe('Core Mechanics & Event Propagation', () => {
    it('initializes missing paths and triggers listeners top-down', () => {
      const { root, spies } = setup({});

      // Action: deeply nest a value where none existed.
      update(root, ['scope', 'target'], 100);

      // 1. Structure is created and frozen
      expect(root.value).toEqual({ scope: { target: 100 } });
      expect(Object.isFrozen(root.value.scope)).toBe(true);

      // 2. Events fire from Parent -> Child (Root -> Branch -> Leaf)
      // The implementation collects deep-first, then reverses execution.
      expect(spies.root).toHaveBeenCalledTimes(1);
      expect(spies.branch).toHaveBeenCalledTimes(1);
      expect(spies.leaf).toHaveBeenCalledTimes(1);

      const [callOrder1] = spies.root.mock.invocationCallOrder;
      const [callOrder2] = spies.branch.mock.invocationCallOrder;
      const [callOrder3] = spies.leaf.mock.invocationCallOrder;

      expect(callOrder1).toBeLessThan(callOrder2);
      expect(callOrder2).toBeLessThan(callOrder3);
    });

    it('provides correct delta context (prev/next) to listeners', () => {
      const { root, spies } = setup({ scope: { target: 10 } });
      update(root, ['scope', 'target'], 20);

      // The listener receives the state *at that specific node*
      const payload = spies.leaf.mock.calls[0][0];
      expect(payload).toMatchObject({
        prev: 10,
        next: 20,
        idxs: [],
      });
    });
  });

  describe('Immutability & Structural Sharing', () => {
    it('preserves references for unchanged branches', () => {
      const siblingRef = { data: 'safe' };
      const { root } = setup({
        scope: { target: 1 },
        sibling: siblingRef,
      });

      const initialRoot = root.value;
      const initialScope = root.value.scope;

      update(root, ['scope', 'target'], 2);

      // The root and modified path are new references
      expect(root.value).not.toBe(initialRoot);
      expect(root.value.scope).not.toBe(initialScope);

      // The untouched branch is referentially identical (structural sharing)
      expect(root.value.sibling).toBe(siblingRef);
    });

    it('avoids triggering listeners when updating with identical values', () => {
      const { root, spies } = setup({ scope: { target: 50 } });
      const initialRef = root.value;

      update(root, ['scope', 'target'], 50);

      // Implementation detail: Structural sharing optimization for identical values
      // is not implemented, so a new object reference is created.
      expect(root.value).not.toBe(initialRef);
      expect(root.value).toEqual(initialRef);

      expect(spies.leaf).not.toHaveBeenCalled(); // Zero events
    });
  });

  describe('Deep Diffing (Implicit Recursion)', () => {
    // This explores `iterChangesDeep`: updating a parent object should
    // trigger listeners on children if the children changed effectively.
    it('detects changes in children when a parent object is replaced', () => {
      const { root, spies } = setup({
        scope: { target: 100, extra: 'kept' },
      });

      // Action: Replace 'scope' entirely. We do not explicitly touch 'target',
      // but 'target' changes from 100 to 999 as a result.
      update(root, ['scope'], { target: 999, extra: 'kept' });

      // The leaf listener for 'target' must fire because the value changed
      expect(spies.leaf).toHaveBeenCalled();
      expect(spies.leaf.mock.calls[0][0]).toMatchObject({
        prev: 100,
        next: 999,
      });
    });

    it('recursively calculates diffs through mixed types', () => {
      // Setup: 'scope' is an object containing 'target'
      const { root, spies } = setup({ scope: { target: 1 } });

      // Action: Change 'scope' to a completely different shape/type (string)
      update(root, ['scope'], 'primitive-replacement');

      // The leaf listener should still fire because 'target' is effectively gone (undefined)
      const payload = spies.leaf.mock.calls[0][0];
      expect(payload.prev).toBe(1);
      expect(payload.next).toBeUndefined();
    });
  });

  describe('Array & Wildcard Handling', () => {
    it('treats numeric path strings as array indices', () => {
      const { root, spies } = setup({ list: [10, 20] });

      // Updating index '1'
      update(root, ['list', '1'], 50);

      expect(root.value.list).toEqual([10, 50]);
      expect(Array.isArray(root.value.list)).toBe(true);

      // Verify index tracking in event payload
      const payload = spies.wildcard.mock.calls[0][0];
      expect(payload.idxs).toEqual([1]);
    });

    it('triggers wildcard listeners for array mutations', () => {
      const { root, spies } = setup({ list: [1, 2] });

      update(root, ['list', '0'], 99);

      // The '*' listener on 'list' should catch the index change
      expect(spies.wildcard).toHaveBeenCalledTimes(1);
      expect(spies.wildcard.mock.calls[0][0]).toMatchObject({
        prev: 1,
        next: 99,
      });
    });

    it('handles type transitions from Object to Array', () => {
      const { root } = setup({ scope: { target: {} } });

      // Force an array structure onto a previous object path
      update(root, ['scope', 'target', '0'], 'item');

      expect(Array.isArray(root.value.scope.target)).toBe(true);
      expect(root.value.scope.target[0]).toBe('item');
    });
  });
});
