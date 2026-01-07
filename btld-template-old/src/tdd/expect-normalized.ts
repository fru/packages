import collapse from 'collapse-whitespace';
import { expect } from 'vitest';

type InputHtml = string | DocumentFragment | HTMLTemplateElement | HTMLElement;

export function normalize(html: InputHtml) {
  if (html instanceof HTMLTemplateElement) return normalize(html.content);
  if (html instanceof DocumentFragment) {
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(html.cloneNode(true));
    return normalize(tempContainer);
  }
  if (html instanceof HTMLElement) {
    collapse(html);
    return html.innerHTML;
  }
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;
  return normalize(tempContainer);
}

export function expectHtmlToContainNormalized(actual: InputHtml, expected: InputHtml) {
  expect(normalize(actual)).toContain(normalize(expected));
}