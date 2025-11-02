import { buildSvgGroup } from './build-svg';
import { describe, it, expect } from 'vitest';

describe('buildSvgGroup', () => {
  it('should build a sprite SVG group correctly', async () => {
    const icons = [
      { id: 'icon1', content: '<svg viewBox="0 0 24 24"><path d="M1 1h22v22H1z"/></svg>' },
      { id: 'icon2', content: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>' },
    ];
    const result = await buildSvgGroup('sprite', icons);
    expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="root-svg-tag">');
    expect(result).toContain('<symbol viewBox="0 0 24 24" id="icon1"><path d="M1 1h22v22H1z"/></symbol>');
    expect(result).toContain('<symbol viewBox="0 0 16 16" id="icon2"><circle cx="8" cy="8" r="8"/></symbol>');
    expect(result).not.toContain('<style>');
  });

  it('should build a stack SVG group correctly', async () => {
    const icons = [
      { id: 'icon3', content: '<svg viewBox="0 0 24 24"><rect x="0" y="0" width="24" height="24"/></svg>' },
    ];
    const result = await buildSvgGroup('stack', icons);
    expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="root-svg-tag">');
    expect(result).toContain('<style type="text/css"><![CDATA[.root-svg-tag > svg:not(:target) { display: none; }]]></style>');
    expect(result).toContain('<svg viewBox="0 0 24 24" id="icon3"><rect x="0" y="0" width="24" height="24"/></svg>');
  });

  it('should handle empty icons array', async () => {
    const result = await buildSvgGroup('sprite', []);
    expect(result).toContain('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="root-svg-tag"/>');
  });

  it('should remove width, height, and xmlns attributes from icons', async () => {
    const icons = [
      { id: 'icon4', content: '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>' },
    ];
    const result = await buildSvgGroup('sprite', icons);
    expect(result).not.toContain('width="100"');
    expect(result).not.toContain('height="100"');
    // The root SVG will always have xmlns, but the icon itself should not
    expect(result).not.toContain('<symbol width="100"');
    expect(result).not.toContain('<symbol height="100"');
    expect(result).not.toContain('<symbol xmlns="http://www.w3.org/2000/svg"');
    expect(result).toContain('<symbol viewBox="0 0 24 24" id="icon4"><path d="M0 0h24v24H0z"/></symbol>');
  });
});