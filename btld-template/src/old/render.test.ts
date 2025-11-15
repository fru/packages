import { it, expect } from 'vitest';
import { render } from './render';
import { appendTemplate, norm } from './tests';

const person = {
  person: {
    update: new Date(),
    firstname: 'Flo', 
    lastname: 'Rue'
  }
};

export function appendTemplate(innerHTML: string) {
  const template = document.createElement('template');
  document.body.appendChild(template);
  template.innerHTML = innerHTML;
  return template;
}

it('Template should render and update on data change', () => {

  const template = appendTemplate(`
    <div fallback="-" data-no-lastname="n/a">
      <span>Update: {{ person.update.@date }}</span>
      <div>Firstname: {{ person.firstname.@fallback }}</div>
      <div>Lastname: {{ person.lastname, @fallback: @data.no-lastname }}</div>
    </div>
  `);
  
  const rendered = render(template);

  expect(norm(rendered)).toContain(norm(`
    <span>Flo</div>
    <div>Rue</div>
    Test
  `))

  rendered.set(person);
  
  expect(norm(rendered)).toContain(norm(`
    <span>Flo</div>
    <div>Rue</div>
    Test
  `))
});



it('Template should render and update on data change', () => {
  const template = appendTemplate(`
    <div fallback="-" data-no-roles="No roles">
      <div>
        {{ person.roles, @fallback: @data.no-roles, @list: name }}
      </div>
    </div>
  `);
  
  const rendered = render(template);

  rendered.set({
    person: { 
      firstname: 'Flo', 
      lastname: 'Rue'
    }
  });
  
  expect(norm(rendered)).toContain(norm(`
    <span>Flo</div>
    <div>Rue</div>
    Test
  `))
});