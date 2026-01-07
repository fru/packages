import { createAttributeObserverStore, setAttrSafe } from './attributes';
import { createEventStore } from './events';
import { css, type Literal } from './literals';

const baseStyleShadow = css`
  :host([no-animation]),
  :host([no-animation]) * {
    transition-duration: 0ms !important;
  }
`;

export abstract class BtldElementBase extends HTMLElement {
  // Stores

  readonly events = createEventStore();
  readonly props = createAttributeObserverStore(this);

  // Literals

  applyScoped(scope: string, ...literals: Literal[]) {
    for (const l of literals) l.apply(this, scope);
  }

  applyShadow(...literals: Literal[]) {
    const shadow = this.attachShadow({ mode: 'open' });
    baseStyleShadow.apply(shadow, '');
    for (const l of literals) l.apply(shadow, '');
  }

  apply(...literals: Literal[]) {
    this.applyScoped('', ...literals);
  }

  // Lifecycle

  connectedCallback() {
    setAttrSafe(this, 'no-animation', true);
    this.connect();

    setTimeout(() => {
      setAttrSafe(this, 'no-animation', false);
    });
  }

  disconnectedCallback() {
    this.events.removeAll();
    this.disconnect();
    setAttrSafe(this, 'no-animation', true);
  }

  attributeChangedCallback(name: string, old: string | null, value: string | null) {
    this.props.attributeChange(name, value);
    this.attributeChanged(name, old, value);
  }

  connectedMoveCallback() {
    this.disconnectedCallback();
    this.connectedCallback();
  }

  // Abstract

  connect() {}
  disconnect() {}
  attributeChanged(name: string, old: string | null, value: string | null) {}
}
