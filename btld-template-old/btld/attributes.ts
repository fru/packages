interface ObservedBase {
  attr: string;
  prop?: string;
  toAttr?: (value: unknown) => string | null;
  attrSync?: true;
}

interface Observed<T> extends ObservedBase {
  toProp: (value: string | null) => T;
}

interface ObservedInstance extends Observed<unknown> {
  // mark as required:
  prop: string;

  // component specific:
  state: unknown;
  setter?: (value: any) => void;
}

const camelCase = (a: string) => a.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

// Helper Functions

function toAttrDefaut(value: unknown) {
  if (value === null || value === undefined || value === false) return null;
  if (value === true) return '';
  return String(value);
}

export function setAttrSafe(el: HTMLElement | undefined, base: ObservedBase | string, value: unknown) {
  if (typeof base === 'string') base = { attr: base };
  if (!el) return;
  const oldValue = el.getAttribute(base.attr);
  const newValue = (base.toAttr ?? toAttrDefaut)(value);

  if (newValue === oldValue) return;
  if (newValue === null) {
    el.removeAttribute(base.attr);
  } else {
    el.setAttribute(base.attr, newValue);
  }
}

// Store

export function createAttributeObserverStore(el: HTMLElement) {
  const store: { [attr: string]: ObservedInstance } = {};

  const api = {
    set(o: ObservedInstance | string, value: unknown, opt?: { noSetter?: true; noAttrSync?: true }) {
      if (typeof o === 'string') o = store[o];
      if (value === o.state) return;
      o.state = value;
      if (!opt?.noSetter && o.setter) o.setter(value);
      if (!opt?.noAttrSync && o.attrSync) setAttrSafe(el, o, value);
    },

    redefine() {
      for (const o of Object.values(store)) {
        Object.defineProperty(el, o.prop, {
          enumerable: true,
          configurable: true,
          get: () => o.state,
          set: (value: unknown) => api.set(o, value),
        });
        store[o.attr].state = o.toProp(el.getAttribute(o.attr));
      }
    },

    observe<T>(observed: Observed<T>, setter?: (value: T) => void): T {
      const state = observed.toProp(null);
      store[observed.attr] = {
        ...observed,
        prop: observed.prop ?? camelCase(observed.attr),
        state,
        setter,
      };
      return state;
    },

    observeBool(o: ObservedBase, setter?: (value: boolean) => void): boolean {
      return this.observe({ ...o, toProp: (v) => v !== null }, setter);
    },

    observeString(o: ObservedBase, setter?: (value: string | null) => void): string | null {
      return this.observe({ ...o, toProp: (v) => v }, setter);
    },

    attributeChange(name: string, attrValue: string | null) {
      let o = store[name];
      if (o) api.set(o, o.toProp(attrValue), { noAttrSync: true });
    },
  };
  return api;
}
