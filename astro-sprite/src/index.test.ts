import { describe, it, expect, vi, type Mock } from 'vitest';
import { serve, buildSvgFiles } from './index';
import { buildSvgGroup, type SpriteConfig, type SvgGroupType, type SVGIconContent } from './build-svg';
import { addVirtualImports } from 'astro-integration-kit';

vi.mock('astro-integration-kit', () => ({
  addVirtualImports: vi.fn(),
}));

vi.mock('./build-svg', () => ({
  buildSvgGroup: vi.fn(),
}));

describe('Astro-Sprite Core Functionality', () => {
  describe('SVG File Building Process', () => {
    it('processes sprite configurations and transforms icon definitions into optimized SVG groups', async () => {
      const icons1 = [{ id: 'icon1', content: '<svg>icon1</svg>' }, { id: 'icon2', content: '<svg>icon2</svg>' }];
      const icons2 = [{ id: 'fa:icon3', content: '<svg>fa:icon3</svg>' }, { id: 'fa:icon4', content: '<svg>fa:icon4</svg>' }];

      const config: SpriteConfig[] = [
        { name: 'icon-set-1', type: 'sprite', icons: icons1 },
        { name: 'icon-set-2', type: 'stack', icons: icons2 },
        { name: 'icon-set-3', type: 'sprite' }, // Handles an empty icon set
      ];

      // Mock the underlying SVG group builder
      (buildSvgGroup as Mock).mockImplementation((type: SvgGroupType, icons: SVGIconContent[]) => {
        return Promise.resolve(`<svg>${type}: ${icons.map(icon => icon.id).join(' ')}</svg>`);
      });

      const result = await buildSvgFiles(config);

      // The function returns a map of sprite names to their generated SVG content
      expect(result).toEqual({
        'icon-set-1': '<svg>sprite: icon1 icon2</svg>',
        'icon-set-2': '<svg>stack: fa:icon3 fa:icon4</svg>',
        'icon-set-3': '<svg>sprite: </svg>', // Empty set produces a valid (empty) SVG container
      });
    });
  });

  describe('Icon Serving Mechanism', () => {
    it('sets up virtual imports and injects routes to make icons available in the Astro application', () => {
      const params = {
        injectRoute: vi.fn(),
      };

      const files = {
        'icon-set-1': '<svg>...</svg>',
        'icon-set-2': '<svg>...</svg>',
      };

      const integration = serve('/_sprite', files);
      integration.hooks['astro:config:setup']?.(params as any);

      // Virtual imports expose the icon data
      expect(addVirtualImports).toHaveBeenCalledWith(params, {
        name: 'fru-astro-sprite',
        imports: {
          'virtual:fru-astro-sprite/sprites': `export default ${JSON.stringify(files)}`,
        },
      });

      // A dynamic route is injected to serve the sprite files
      expect(params.injectRoute).toHaveBeenCalledWith({
        pattern: '/_sprite/[sprite].svg',
        prerender: true,
        entrypoint: '@fru/astro-sprite/src/astro-entry.ts',
      });
    });
  });

  
});