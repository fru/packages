import collapse from 'collapse-whitespace';

export function appendTemplate(innerHTML: string) {
  const template = document.createElement('template');
  document.body.appendChild(template);
  template.innerHTML = innerHTML;
  return template;
}

export function norm(html: string | DocumentFragment | HTMLTemplateElement | HTMLElement) {
  if (html instanceof HTMLTemplateElement) return norm(html.content);
  if (html instanceof DocumentFragment) {
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(html.cloneNode(true));
    return norm(tempContainer);
  }
  if (html instanceof HTMLElement) {
    collapse(html);
    return html.innerHTML;
  }
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;
  return norm(tempContainer);
}