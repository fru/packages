import type { AstroIntegration } from 'astro';
import { addVirtualImports } from 'astro-integration-kit';
import { buildSvgGroup, type SVGIconContent } from './build-svg';

export * from './build-iconify';
export * from './build-svg';

export interface SpriteConfig {
  name: string;
  type: 'sprite' | 'stack';
  icons?: SVGIconContent[];
}

export function serve(rootUrl: string, config: SpriteConfig[]): AstroIntegration {
  const sprites = config.map(({ name, type, icons }) => {
    return [name, buildSvgGroup(type, icons || [])];
  });
  const stringified = JSON.stringify(Object.fromEntries(sprites));

  return {
    name: 'fru-astro-sprite',
    hooks: {
      'astro:config:setup': (params) => {
        addVirtualImports(params, {
          name: 'fru-astro-sprite',
          imports: {
            'virtual:fru-astro-sprite/sprites': `export default ${stringified}`,
          },
        });
        params.injectRoute({
          pattern: rootUrl + '/[sprite].svg',
          prerender: true,
          entrypoint: '@fru/astro-sprite/src/astro-entry.ts',
        });
      },
    },
  };
}