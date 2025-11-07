import { describe, it, expect } from 'vitest';
import { render } from './render';
import { appendTemplate, norm } from './tests';



describe('helloWorld', () => {
  it('should return "Hello World!"', () => {
    const template = appendTemplate(`
      <div>{{ person.firstname }}</div>
      <div>{{ person.lastname }}</div>
      <div>{{ person.@fullname }}</div>
      Test
    `);
    const rendered = render(template);
    console.log(norm(rendered));
    expect(norm(rendered)).toContain(norm(template))
    //expect(rendered.innerHTML).toMatch(/<div/);
  });
});