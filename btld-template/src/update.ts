import { $listener, isComplexType, isIndex, Event, Listener, ListenerTree, Path, Root } from './helper';

export function update(root: Root, path: Path, value: unknown) {
  const changes: [Listener, Event][] = [];

  root.value = iterChangesRoot(path, root.value, root.hooks, []);
  changes.reverse().forEach(([l, e]) => l(e));

  function iterChangesRoot(path: Path, prev: any, hooks: ListenerTree, idxs: number[]) {
    if (!path.length) return (iterChangesDeep(value, prev, hooks, idxs), value);
    const [k, ...rest] = path;

    const match = isComplexType(prev) && Array.isArray(prev) === isIndex(k);
    let next: any = isIndex(k) ? [] : {};
    if (match) next = isIndex(k) ? [...prev] : { ...prev };
    else iterChangesDeep(next, prev, hooks, idxs);

    next[k] = iterChangesRoot(rest, prev?.[k], hooks?.[glob(k)], concat(idxs, k));

    for (const listener of hooks?.[$listener] ?? []) {
      changes.push([listener, { idxs, prev, next }]);
    }
    return Object.freeze(next);
  }

  function iterChangesDeep(next: any, prev: any, hooks: ListenerTree, idxs: number[]) {
    if (prev === next || !hooks) return;

    if (isComplexType(prev) || isComplexType(next)) {
      const count = changes.length;
      const keys = [...Object.keys(prev ?? {}), ...Object.keys(next ?? {})];
      for (const k of new Set(keys)) {
        iterChangesDeep(next?.[k], prev?.[k], hooks?.[glob(k)], concat(idxs, k));
      }
      if (count === changes.length) return;
    }

    for (const listener of hooks?.[$listener] ?? []) {
      changes.push([listener, { idxs, prev, next }]);
    }
  }
}

const glob = (prop: string) => (isIndex(prop) ? '*' : prop);
const concat = (idxs: number[], prop: string) => (isIndex(prop) ? [...idxs, +prop] : idxs);
