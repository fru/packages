export type BtldContext = HTMLElement;

export function btld(tag: string, definition: (el: BtldContext) => void) {
  if (customElements.get(tag)) {
    throw new Error(`${tag} is already defined as web component`);
  }

  const WC = class extends HTMLElement {
    constructor() {
      super();
      definition(this);
    }
  };

  customElements.define(tag, WC);
}
