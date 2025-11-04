import type { AstroIntegration } from 'astro';
import { addVirtualImports } from 'astro-integration-kit';
import { buildSvgGroup, type SpriteConfig } from './build-svg';

export * from './build-iconify';
export * from './build-svg';

export type SpriteFiles = Record<string, string>;

export async function buildSvgFiles(config: SpriteConfig[]): Promise<SpriteFiles> {
  const groups = config.map(async ({ name, type, icons }) => {
    return [name, await buildSvgGroup(type, icons || [])];
  });
  return Object.fromEntries(await Promise.all(groups));
}

export function serve(rootUrl: string, files: SpriteFiles): AstroIntegration {
  const groups = JSON.stringify(files);

  return {
    name: 'fru-astro-sprite',
    hooks: {
      'astro:config:setup': (params) => {
        addVirtualImports(params, {
          name: 'fru-astro-sprite',
          imports: {
            'virtual:fru-astro-sprite/sprites': `
              export const sprites = ${groups};
              export const rootUrl = "${rootUrl}";
            `,
          },
        });
        params.injectRoute({
          pattern: rootUrl + '/[sprite].svg',
          prerender: true,
          entrypoint: '@fru/astro-sprite/astro-entry.ts',
        });
      },
    },
  };
}