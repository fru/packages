import { buildIconifyResolver } from './build-iconify';
import { describe, it, expect } from 'vitest';
import type { IconifyJSON } from "@iconify/types";

describe('buildIconifyResolver', () => {
  const mockFamilyDefinition: IconifyJSON = {
    prefix: 'test',
    icons: {
      'icon1': { body: '<path d="M1 1h22v22H1z"/>' },
      'icon2': { body: '<circle cx="8" cy="8" r="8"/>' },
    },
    width: 24,
    height: 24,
    aliases: {},
  };

  it('should return a function that resolves iconify icons', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    expect(typeof resolver).toBe('function');
  });

  it('should correctly build SVG content for existing icons', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    const result = resolver(['icon1', 'icon2']);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'test-family--icon1',
      content: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M1 1h22v22H1z"/></svg>',
    });
    expect(result[1]).toEqual({
      id: 'test-family--icon2',
      content: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><circle cx="8" cy="8" r="8"/></svg>',
    });
  });

  it('should filter out non-existent icons', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    const result = resolver(['icon1', 'non-existent-icon', 'icon2']);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('test-family--icon1');
    expect(result[1].id).toBe('test-family--icon2');
  });

  it('should return an empty array if no icons are provided', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    const result = resolver([]);
    expect(result).toEqual([]);
  });

  it('should return an empty array if no icons are found', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    const result = resolver(['non-existent-icon']);
    expect(result).toEqual([]);
  });
});