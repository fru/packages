import { getIconData, iconToSVG, iconToHTML } from '@iconify/utils';
import type { IconifyJSON } from '@iconify/types';
import type { AstroIntegration } from 'astro';
import { addVirtualImports } from 'astro-integration-kit';
import { createSvg, type SVGContent } from './build-stack';

export interface SpriteConfig {
  sprite: string;
  iconify?: Record<string, string[]>;
}

export async function buildSprites(config: SpriteConfig[], iconify: Record<string, IconifyJSON>) {
  const result: Record<string, string> = {};
  for (const { sprite, iconify: icons } of config) {
    const svgs: SVGContent[] = [];
    if (icons) {
      for (const [family, names] of Object.entries(icons)) {
        for (const name of names) {
          if (!iconify[family]) throw new Error(`Icon family ${family} not found in iconify set`);
          const data = getIconData(iconify[family], name);
          if (!data) throw new Error(`Icon ${name} not found in family ${family}`);
          const rendered = iconToSVG(data);
          const content = iconToHTML(rendered.body, rendered.attributes);
          svgs.push({ id: family + '--' + name, content });
        }
      }
    }
    result[sprite] = await createSvg(svgs);
  }
  return result;
}

export function serve(rootUrl: string, sprites: unknown): AstroIntegration {
  return {
    name: 'fru-astro-sprite',
    hooks: {
      'astro:config:setup': (params) => {
        addVirtualImports(params, {
          name: 'fru-astro-sprite',
          imports: {
            'virtual:fru-astro-sprite/sprites': `export default ${JSON.stringify(sprites)}`,
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
