import type { APIRoute } from 'astro';
import { sprites } from 'virtual:fru-astro-sprite/sprites';

export async function getStaticPaths() {
  return Object.keys(sprites).map((sprite) => ({
    params: { sprite },
  }));
}

export const GET: APIRoute<{ sprite: string }> = async ({ params }) => {
  return new Response(sprites[params.sprite!], {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
