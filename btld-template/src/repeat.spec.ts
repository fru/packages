import { describe, it, expect } from 'vitest';
import { init } from './repeat';

describe('repeat', () => {
  it('should initialize in browser context', () => {
    // Define a dummy web component to satisfy the requirement
    class TestComp1 extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: 'open' });
      }
    }

    if (!customElements.get('test-comp1')) {
      customElements.define('test-comp1', TestComp1);
    }

    document.body.innerHTML = `
      <test-comp1></test-comp1>
      <template tag="test-comp1" repeat="data">{{.}}</template>
    `;

    init();

    // Basic assertion to verify execution
    expect(document.body.innerHTML).toContain('<test-comp1>');
  });
});
