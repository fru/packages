export type Path = readonly string[];
export type Listener = (update: Event) => void;
export type ListenerTree = ListenerNode | undefined;

export interface Event<T = unknown> {
  idxs: number[];
  prev: T;
  next: T;
}

export interface Root {
  value: unknown;
  hooks: ListenerTree;
}

export interface ListenerNode {
  [prop: string | '*']: ListenerTree;
  [$listener]: Listener[];
}

export const $listener = Symbol();
export const $deep_frozen = Symbol();
export const $path = Symbol();
export const $root = Symbol();

// Truthy check used to excludes null.
export const isComplexType = (v: any) => !!v && typeof v === 'object';

export const isIndex = (prop: string) => prop && +prop >= 0 && Number.isInteger(+prop);
