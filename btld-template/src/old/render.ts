function toTemplate(template: string | HTMLTemplateElement): HTMLTemplateElement {
  if (template instanceof HTMLTemplateElement) return template;
  const templateElement = document.createElement('template');
  templateElement.innerHTML = template;
  return templateElement;
}


export function render(template: string | HTMLTemplateElement): DocumentFragment {
  return toTemplate(template).content;
}