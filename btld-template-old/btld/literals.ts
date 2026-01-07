export interface Literal {
  apply: (el: ShadowRoot | Element, scope: string) => void;
}

export function css(strings: TemplateStringsArray, ...values: any[]): Literal {
  const content = String.raw(strings, ...values);
  const cache: { [key: string]: CSSStyleSheet } = {};

  return {
    apply(el: ShadowRoot | Element, scope: string) {
      const root = el instanceof ShadowRoot ? el : document;
      if (cache[scope] && !(el instanceof ShadowRoot)) return;

      if (!cache[scope]) {
        // Replace [_] with [_scope] and [_="value"] with [_scope="value"]
        // (?=...): positive lookahead, doesn't include character set in the match
        let scoped = scope ? content.replace(/\[_(?=[\]=])/g, `[_${scope}`) : content;

        cache[scope] = new CSSStyleSheet();
        cache[scope].replaceSync(scoped);
      }

      root.adoptedStyleSheets.push(cache[scope]);
    },
  };
}

export function html(strings: TemplateStringsArray, ...values: any[]): Literal {
  const content = String.raw(strings, ...values);

  return {
    apply(el: ShadowRoot | Element, scope: string) {
      // Replace _="value" with _scope="value" if preceded by whitespace
      // () creates a capturing group, stored as $1
      let scoped = scope ? content.replace(/(\s)_(?=\=")/g, `$1_${scope}`) : content;

      const fragment = document.createElement('template');
      fragment.innerHTML = scoped;
      el.prepend(fragment.content);
    },
  };
}
