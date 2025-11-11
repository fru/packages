import { Func, Primitive } from "./helper";

// Normalized path, starting at root no @ utility functions
type NormalizedPath = string & { _guard: never };
 
type Listener = Func;

const $object = Symbol("object");
const $array = Symbol("array");
const $deleted = Symbol("deleted");

type StateType = typeof $object | typeof $array | typeof $deleted;

interface StateNode {
  data: Primitive | Func | StateType;
  keys: Map<string, NormalizedPath>;
  path: NormalizedPath;

  listenerThis: Set<Listener>;
  listenerDeep: Set<Listener>;
}

function join(path: NormalizedPath, segment: string | number): NormalizedPath {
  return (path + '.' + segment) as NormalizedPath;
}

class State<T> {
  // Flat map of all state nodes anywhere under root
  _store = new Map<NormalizedPath, StateNode>();

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
      stored.listenerDeep.add(listener);
    } else {
      stored.listenerThis.add(listener);
    }
  }
}
