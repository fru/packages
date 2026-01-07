export function createEventStore() {
  const cleanup: (() => void)[] = [];

  type Evt = HTMLElementEventMap;

  return {
    add<T extends keyof Evt>(el: EventTarget, type: T, listener: (ev: Evt[T]) => void) {
      el.addEventListener(type, listener as EventListener);
      cleanup.push(() => el.removeEventListener(type, listener as EventListener));
    },

    removeAll() {
      cleanup.forEach((callback) => callback());
      cleanup.length = 0;
    },
  };
}
