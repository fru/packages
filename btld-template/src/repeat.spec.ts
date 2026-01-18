import { describe, it, expect } from 'vitest';
import { init } from './repeat';

describe('repeat', () => {
  it('simple array of strings', () => {
    const body = `
      <test-c1></test-c1>
      <template tag="test-c1" repeat="arr">{{.}}</template>
    `;

    const { text, state } = harness(body);

    state.$set({
      arr: ['a', 'b', 'c'],
    });

    expect(text()).toContain('a b c');
  });
});
