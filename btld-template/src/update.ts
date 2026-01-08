export type Path = readonly string[];
export type Listener = (update: Event) => void;

export interface Event<T = unknown> {
  idxs: number[];
  prev: T;
  next: T;
  reordered?: true; // TODO add ids where the reuse happened
}

export interface Root { 
  value: unknown; 
  hooks: ListenerTree;
}

export type ListenerTree = undefined | {
  [prop: string | '*']: ListenerTree;
  [$listener]: Listener[];
};

export const $listener = Symbol();
export const $deep_frozen = Symbol();

/**
 * Is object or array type? Truthy check, explicitly excludes null.
 * @param value 
 * @returns boolean
 */
export const isComplexType = (v: any) => !!v && typeof v === 'object';

const isIndex = (prop: string) => prop && +prop >= 0 && Number.isInteger(+prop);
const glob = (prop: string) => isIndex(prop) ? '*' : prop;

function update<T>(root: Root, path: Path, value: unknown) {
  const changesRoot: [Listener, Event][] = [];
  const changesDeep: [Listener, Event][] = [];
  
  root.value = iterChangesRoot(root.value, root.hooks, path);
  [...changesRoot, ...changesDeep.toReversed()].forEach(([l, e]) => l(e));

  function iterChangesRoot(prev: any, hooks: ListenerTree, path: Path) {
    if (!path.length) return iterChangesDeep(prev, value, hooks), value;
    const mismatch = Array.isArray(prev) !== isIndex(path[0]);
    // TODO case: path has different type then prev
    
    const child = iterChangesRoot(prev, hooks?.[glob(path[0])], path.slice(1));
  } 

  function iterChangesDeep(prev: any, next: any, hooks: ListenerTree) {
    if (prev === next || !hooks) return;

    if (!isComplexType(prev) && !isComplexType(next)) {

    } else {
    
    const keys = new Set([
      ...Object.keys(prev ?? {}), 
      ...Object.keys(next ?? {})
    ]);
    for (const k of keys) {
      iterChangesDeep(prev?.[k], next?.[k], hooks?.[glob(k)]);
    }
  }
  } 
}