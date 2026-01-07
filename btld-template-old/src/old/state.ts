// @ts-nocheck

import { Func, Primitive, isPrimitive, isFunc } from "./helper";

// Normalized path, starting at root no @ utility functions
type NormalizedPath = string & { _guard: never };
 
type Listener = Func;

const $object = Symbol("object");
const $array = Symbol("array");

type StateType = typeof $object | typeof $array;

type WasChanged = boolean;

class StateNode {
  data: Primitive | Func | StateType;
  keys?: Map<string, StateNode>;
  listener?: Set<Listener>;

  constructor(public readonly path: NormalizedPath) {}
  
  proxy(): unknown {
    if (this.data !== $object && this.data !== $array) return this.data;

    const get = (_: unknown, p: string) => this.keys?.get(p)?.proxy();
    const ownKeys = () => Array.from(this.keys?.keys() ?? []);
    const getOwnPropertyDescriptor = () => ({ enumerable: true, configurable: true });

    if (this.data === $array) return new Proxy([], { get });
    return new Proxy({}, { get, ownKeys, getOwnPropertyDescriptor });
  }

  ensure(type: StateType): WasChanged {

  }

  set(value: unknown): WasChanged {
    
    if (isPrimitive(value) || isFunc(value)) {
      if (this.data === value) return false;
      if (this.data === $object || this.data === $array) {
        // set all keys to undefined

      }
      return true;
    } else {
      const changes = false;
      for (const key of this.keys?.keys() ?? []) {
        // if any children have changed also add listener to output
      }
      return changes;
    }
  }
}





function join(path: NormalizedPath, segment: string | number): NormalizedPath {
  return (path + '.' + segment) as NormalizedPath;
}

class State<T> {
  // Flat map of all state nodes anywhere under root
  _store = new Map<NormalizedPath, StateNode>();

  proxy() {
    if ()
  }



  set(path: NormalizedPath, value: unknown): void {
    // iterate down from root:
    //  - ensure segments are array / object
    //  - collect deep update listeners

    // iterate all deep nodes
    // filter: deleted and not updated by this call
    // include nodes just added by this call
    // include nodes that got updated to deleted and set there children as well
    // iterate depth first so we can filter nodes that didnt change
    //  - set data to the right value
    //  - collect listeners & deep listeners
  }

  get(path: NormalizedPath): unknown {
    const { data, keys } = this._store.get(path)!;
    if (data === $deleted) return undefined;
    if (data === $array) {
      const length = this.get(join(path, 'length'));
      return new Array(length).map((_, i) => this.get(join(path, i)));
    }
    if (data === $object) {
      const obj: Record<string, unknown> = {};
      for (const [key, subpath] of keys.entries()) {
        const child = this.get(subpath);
        if (child !== $deleted) obj[key] = child;
      }
      return obj;
    } 
    return data;
  }

  listen(path: NormalizedPath, listener: Listener, deep: boolean): void {
    const stored = this._store.get(path)!;
    if (deep) {
      (stored.listenerDeep ??= new Set()).add(listener);
    } else {
      (stored.listenerThis ??= new Set()).add(listener);
    }
  }
  proxy_old(path: NormalizedPath = '' as NormalizedPath): unknown {
    const { data, keys } = this._store.get(path)!;
    if (data === $deleted) return undefined;
    if (data === $array) {
      const length = this.proxy(join(path, 'length')) as number;
      return new Proxy(new Array(length), {
        get: (target: unknown[], p: string | symbol): unknown => {
          if (typeof p === 'symbol' || isNaN(Number(p))) {
            return Reflect.get(target, p);
          }
          return this.proxy(join(path, Number(p)));
        },
        ownKeys: (target: unknown[]): ArrayLike<string> => {
          return new Array(length).fill(0).map((_, i) => String(i));
        },
        getOwnPropertyDescriptor: (target: unknown[], p: string | symbol): PropertyDescriptor | undefined => {
          if (typeof p === 'symbol' || isNaN(Number(p)) || Number(p) >= length) {
            return undefined;
          }
          return {
            enumerable: true,
            configurable: true,
            value: this.proxy(join(path, Number(p)))
          };
        }
      });
    }
    if (data === $object) {
      const obj: Record<string, unknown> = {};
      return new Proxy(obj, {
        get: (target: object, p: string | symbol): unknown => {
          if (typeof p === 'symbol') {
            return Reflect.get(target, p);
          }
          const subpath = keys.get(p as string);
          if (!subpath) return undefined;
          return this.proxy(subpath);
        },
        ownKeys: (): ArrayLike<string> => {
          return Array.from(keys.keys());
        },
        getOwnPropertyDescriptor: (target: object, p: string | symbol): PropertyDescriptor | undefined => {
          if (typeof p === 'symbol' || !keys.has(p as string)) {
            return undefined;
          }
          return {
            enumerable: true,
            configurable: true,
            value: this.proxy(keys.get(p as string)!)
          };
        }
      });
    }
    return data;
  }
}
