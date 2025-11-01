import type { APIRoute } from 'astro';

// @ts-ignore
import sprites from 'virtual:fru-astro-sprite/sprites';

export async function getStaticPaths() {
  return Object.keys(sprites).map((sprite) => ({
    params: { sprite },
  }));
}

export const GET: APIRoute = async ({ params }: any) => {
  return new Response(sprites[params.sprite], {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
