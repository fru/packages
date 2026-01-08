import { $listener, isComplexType, isIndex, Event, Listener, ListenerTree, Path, Root } from './helper';

export function update(root: Root, path: Path, value: unknown) {
  const changesRoot: [Listener, Event][] = [];
  const changesDeep: [Listener, Event][] = [];

  root.value = iterChangesRoot(path, root.value, root.hooks, []);
  [...changesRoot, ...changesDeep.reverse()].forEach(([l, e]) => l(e));

  function iterChangesRoot(path: Path, prev: any, hooks: ListenerTree, idxs: number[]) {
    if (!path.length) return (iterChangesDeep(value, prev, hooks, idxs), value);
    const [k, ...rest] = path;

    const match = isComplexType(prev) && Array.isArray(prev) === isIndex(k);
    const next = cloneNode(match, prev);
    if (!match) iterChangesDeep(next, prev, hooks, idxs);

    for (const listener of hooks?.[$listener] ?? []) {
      changesRoot.push([listener, { idxs, prev, next }]);
    }

    next[k] = iterChangesRoot(rest, prev?.[k], hooks?.[glob(k)], concat(idxs, k));
    return Object.freeze(next);
  }

  function iterChangesDeep(next: any, prev: any, hooks: ListenerTree, idxs: number[]) {
    if (prev === next || !hooks) return;

    if (isComplexType(prev) || isComplexType(next)) {
      const count = changesDeep.length;
      const keys = [...Object.keys(prev ?? {}), ...Object.keys(next ?? {})];
      for (const k of new Set(keys)) {
        iterChangesDeep(next?.[k], prev?.[k], hooks?.[glob(k)], concat(idxs, k));
      }
      if (count === changesDeep.length) return;
    }

    for (const listener of hooks?.[$listener] ?? []) {
      changesDeep.push([listener, { idxs, prev, next }]);
    }
  }
}

const glob = (prop: string) => (isIndex(prop) ? '*' : prop);
const concat = (idxs: number[], prop: string) => (isIndex(prop) ? [...idxs, +prop] : idxs);

function cloneNode(copy: boolean, node: any) {
  if (Array.isArray(node)) return copy ? [...node] : [];
  return copy ? { ...node } : {};
}
