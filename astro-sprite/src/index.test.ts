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

describe('astro-sprite', () => {
  describe('serve', () => {
    it('should call addVirtualImports with correct parameters', () => {
      const files = {
        'icon-set-1': '<svg>...</svg>',
        'icon-set-2': '<svg>...</svg>',
      };
      const integration = serve('/_sprite', files);

      const params = {
        updateConfig: vi.fn(),
        addWatchFile: vi.fn(),
        injectRoute: vi.fn(),
      };

      integration.hooks['astro:config:setup']?.(params as any);

      expect(addVirtualImports).toHaveBeenCalledWith(params, {
        name: 'fru-astro-sprite',
        imports: {
          'virtual:fru-astro-sprite/sprites': `export default ${JSON.stringify(files)}`,
        },
      });

      expect(params.injectRoute).toHaveBeenCalledWith({
        pattern: '/_sprite/[sprite].svg',
        prerender: true,
        entrypoint: '@fru/astro-sprite/src/astro-entry.ts',
      });
    });
  });

  describe('buildSvgFiles', () => {
    it('should call buildSvgGroup for each sprite config and return grouped files', async () => {
      const icons1 = [{ id: 'icon1', content: '<svg>icon1</svg>' }, { id: 'icon2', content: '<svg>icon2</svg>' }];
      const icons2 = [{ id: 'fa:icon3', content: '<svg>fa:icon3</svg>' }, { id: 'fa:icon4', content: '<svg>fa:icon4</svg>' }];

      const config: SpriteConfig[] = [
        { name: 'icon-set-1', type: 'sprite', icons: icons1 },
        { name: 'icon-set-2', type: 'stack', icons: icons2 },
        { name: 'icon-set-3', type: 'sprite' }, // Test case for undefined icons
      ];

      (buildSvgGroup as Mock).mockImplementation((type: SvgGroupType, icons: SVGIconContent[]) => {
        return Promise.resolve(`<svg>${type}: ${icons.map(icon => icon.id).join(' ')}</svg>`);
      });

      const result = await buildSvgFiles(config);

      expect(buildSvgGroup).toHaveBeenCalledTimes(3);
      expect(buildSvgGroup).toHaveBeenCalledWith('sprite', icons1);
      expect(buildSvgGroup).toHaveBeenCalledWith('stack', icons2);
      expect(buildSvgGroup).toHaveBeenCalledWith('sprite', []); // Expect empty array when icons is undefined

      expect(result).toEqual({
        'icon-set-1': '<svg>sprite: icon1 icon2</svg>',
        'icon-set-2': '<svg>stack: fa:icon3 fa:icon4</svg>',
        'icon-set-3': '<svg>sprite: </svg>',
      });
    });
  });
});