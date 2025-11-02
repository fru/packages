import { buildSvgGroup } from './build-svg';
import { describe, it, expect } from 'vitest';

describe('SVG Group Builder Functionality', () => {

  it('builds a "sprite" SVG group, embedding individual icons as symbols for efficient reuse', async () => {

    const icons = [
      { id: 'journey-icon-1', content: '<svg viewBox="0 0 24 24"><path d="M1 1h22v22H1z"/></svg>' },
      { id: 'journey-icon-2', content: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>' },
    ];
    const result = await buildSvgGroup('sprite', icons);

    expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="root-svg-tag">');
    expect(result).toContain('<symbol viewBox="0 0 24 24" id="journey-icon-1"><path d="M1 1h22v22H1z"/></symbol>');
    expect(result).toContain('<symbol viewBox="0 0 16 16" id="journey-icon-2"><circle cx="8" cy="8" r="8"/></symbol>');
    expect(result).not.toContain('<style>');
  });

  it('constructs a "stack" SVG group, where icons are layered and controlled by CSS for display', async () => {

    const icons = [
      { id: 'journey-icon-3', content: '<svg viewBox="0 0 24 24"><rect x="0" y="0" width="24" height="24"/></svg>' },
    ];
    const result = await buildSvgGroup('stack', icons);

    expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="root-svg-tag">');
    expect(result).toContain('<style type="text/css"><![CDATA[.root-svg-tag > svg:not(:target) { display: none; }]]></style>');
    expect(result).toContain('<svg viewBox="0 0 24 24" id="journey-icon-3"><rect x="0" y="0" width="24" height="24"/></svg>');
  });

  it('handles an empty icon array, yielding an empty SVG container', async () => {

    const result = await buildSvgGroup('sprite', []);
    expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="root-svg-tag"/>');
  });

  it('removes extraneous attributes like width, height, and xmlns from individual icon SVGs during integration', async () => {
    
    const icons = [
      { id: 'journey-icon-4', content: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>' },
    ];
    const result = await buildSvgGroup('sprite', icons);

    expect(result).not.toContain('width="100"');
    expect(result).not.toContain('height="100"');
    expect(result).not.toContain('<symbol xmlns="http://www.w3.org/2000/svg"');
    expect(result).toContain('<symbol viewBox="0 0 24 24" id="journey-icon-4"><path d="M0 0h24v24H0z"/></symbol>');
  });
});