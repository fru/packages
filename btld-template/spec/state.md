# BTLD Reactive State

## Decisions + Listed Consequences

### Precisely track what exactly changes
- Less updates to the dom
- More individual listeners for each state

### State is a tree, without cycles
- Support data types: primitives, objects, arrays and functions

### State closely mirrors what needs to be rendered

### Recording what state is used in a function is not needed
- Buildin functions that reflect state to the dom have very explicit dependencies
- Computed functions define there dependencies, e.g. useState(path) that is only recorded once

### Array Sort, Insert, Delete, should not trigger all deep listeners
- The listerns miror what actually needs to transform in the dom
- Problem *index*: array.2.value should it trigger when item at index 2 moves to index 1?

### There are no listeners for individual array indices, only for all array items
- The internal listener path would be more like array.*.value
- The change listener now gets the index where the change happened
- When an item is moved only listeners for the path "array.*" are triggered, this solves Problem *index* 
- Deep arrays are supported: array.\*.array2.\*.value *or* array.\*.\*.value 

### Listened to dependencies, should not need to be recalculated
- array[index] would mean the listener location would change when "index" changes
- arbritary computed functions would mean listeners need recalculation on every call

### Relative "paths" can be used to access state
- Path can start with @root or multiple @parent "segments"

### Path can be made up of dot seperated segments
- @root.some.path.to.value 
- Array index are constants array.2.value 

### Watching a deep subtree is needed when this is passed to another framework or component
- Data that is passed needs to be frozen, be a copy or have a readonly proxy
- Example *subtree*: \<JsonRenderer bind="data: @root.subtree" />

### Setting a property to undefined can affect all listeners deep in the tree
- need to iterate deep listeners, when an object or array converts to primitive


## Name all needed recursions / loops

## Name all functions

## Interface Design

```typescript

```
