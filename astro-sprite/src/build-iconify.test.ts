import { buildIconifyResolver } from './build-iconify';
import { describe, it, expect } from 'vitest';
import type { IconifyJSON } from "@iconify/types";

describe('Iconify Resolver Functionality', () => {
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

  it('creates a resolver function from an Iconify family definition', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    expect(typeof resolver).toBe('function');
  });

  it('transforms known icon names into their full SVG representations', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    const result = resolver(['icon1', 'icon2']);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('test-family--icon1');
    expect(result[0].content).toContain('<path d="M1 1h22v22H1z"/>');
    expect(result[1].id).toBe('test-family--icon2');
    expect(result[1].content).toContain('<circle cx="8" cy="8" r="8"/>');
  });

  it('filters out requests for icons that do not exist within the family', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    const result = resolver(['icon1', 'non-existent-icon', 'icon2']);

    expect(result).toHaveLength(2);
    expect(result.map(item => item.id)).toEqual(['test-family--icon1', 'test-family--icon2']);
  });

  it('returns an empty list when no icons are requested', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    const result = resolver([]);
    expect(result).toEqual([]);
  });

  it('returns an empty list if only non-existent icons are requested', () => {
    const resolver = buildIconifyResolver('test-family', mockFamilyDefinition);
    const result = resolver(['another-non-existent-icon']);
    expect(result).toEqual([]);
  });
});