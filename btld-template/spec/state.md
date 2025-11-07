# BTLD State

TODO cleanup library description:
 - btld-state is used as a minimal state management library primarily for use in btld-template
 - reactive updates to dom
 - state tree mirrors dom 

## Accessor Path Parsing

```typescript
interface PathSegement {
  segment: string,
  isUtilFunc: boolean
}

type Path = PathSegement[];

const cache = new Map<string, Path>();

function parsePath(path: string): Path {
  const parse = () => Object.freeze(path.split('.').map(parseSegment));
  return existsOrCreate(cache, path, parse);
}

function parseSegment(segment: string): PathSegement {
  const isUtilFunc = rawSegment.startsWith('@');
  return Object.freeze({ segment, isUtilFunc });
}
```

## Utility Function Registy

```typescript

type Computed<T extends BtldState[]> = {
  watch: T,
  value: (...args: T) => unknown
}

type UtilFunc = (state: BtldState, el: HTMLElement) => BtldState | Computed;

const registry = new Map<string, Func>();

export function globalUtilFunctions(definitions: Record<string, UtilityFunction>) {
  for (const [name, func] of Object.entries(definitions)) {
    registry.set(name, func);
  }
}

globalUtilFunctions({
  '@fullname': (state) = ({
    watch: [
      state.get('firstname'), 
      state.get('lastname')
    ],
    value: (first, last) => `${first} ${last}`,
  })
});

```

## Helpers

```typescript

```
## Btld State

```typescript

enum StateType {
  Value = 1,
  Deleted = 2,
  Array = 3,
  Object = 4,
}

class BtldState {
  
  readonly _root: BtldState;
  readonly _parent: BtldState | null;
  readonly _segment: string | null;

  private constructor(parent: BtldState | null, segement: string | null) {
    this._parent = parent;
    this._segment = segement;
    this._root = parent ? parent._root : this;
  }
  
  _props?: Map<string, BtldState>;
  _array?: BtldState[];
  _length: number = 0;

  _existsOrCreateProp(key: string): BtldState {
    const creator = () => new BtldState(this, key);
    return existsOrCreate(this._children ??= new Map(), key, creator);
  }

  _setArrayLength(length: number) {
    this._length = length;

    // TODO 
  }

  _type: StateType = StateType.Value;
  _value: Primitive | Func;
  

  value(): unknown {
    if (this._type === StateType.Value) return this._value;
    if (this._type === StateType.Deleted) return undefined;
    if (this._type === StateType.Array) {
      return new Array(this._length).map((_, i) => this._existsOrCreateChild(i).value());
    }
    if (this._type === StateType.Object) {
      const obj: Record<string, unknown> = {};
      for (const [key, child] of this._children.entries()) {
        if (child._type !== StateType.Deleted) obj[key] = child.value();
      }
      return obj;
    }
  }

  set(value: unknown, avoid_loops: Set<unknown> = new Set()): void {
    if (existsOrAdd(avoid_loops, value)) return;

    if (isPrimitive(value) || isFunc(value)) {
      this._value = value;
      this._type = StateType.Value;
    } else {
      this._value = this._hasValue = undefined;
      this._arrayLength
      
      = Array.isArray(value);

      const keys = new Set(Object.keys(value));

      for (const key of keys) {
        this._ensureChild(key).set(value[key], avoid_loops);
      }

      for (const key of this._children.keys()) {
        if (!keys.has(key)) this._children.get(key)!.set(undefined);
      }
    }
  }

  get(path: string): BtldState {


  }


}