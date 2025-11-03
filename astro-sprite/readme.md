# Astro Sprite

[![Coverage Status](https://coveralls.io/repos/github/fru/packages/badge.svg?branch=main&flag_name=astro-sprite)](https://coveralls.io/github/fru/packages?branch=main&flag_name=astro-sprite)

Astro Sprite is an Astro integration that simplifies the use of SVG sprites in your Astro projects. It allows you to easily define and build SVG sprites from various icon sources, including Iconify collections.

## Features

- **Effortless SVG Sprite Generation**: Define your icons and let Astro Sprite build optimized SVG sprites.
- **Iconify Integration**: Seamlessly integrate icons from popular Iconify collections.
- **Flexible Configuration**: Customize sprite names, types, and icon sets.

## Installation

```bash
npm install @fru/astro-sprite
```

## Usage

### Configuration

### Configuration

First, create a file (e.g., `src/sprites.ts`) to define your sprite configuration and build the SVG files. This example demonstrates how to create two sprite stacks, `accordion` and `accordion-horizontal`, using icons from various Iconify collections.

```typescript
// src/sprites.ts
import { buildSvgFiles, buildIconifyResolver, type SpriteConfig } from '@fru/astro-sprite';

// Import icon collections
import { icons as iconsLucide } from '@iconify-json/lucide';
import { icons as iconsMynaui } from '@iconify-json/mynaui';

// Create icon resolvers
const lucide = buildIconifyResolver('lucide', iconsLucide);
const mynaui = buildIconifyResolver('mynaui', iconsMynaui);

// Define your sprite configuration
const config: SpriteConfig[] = [
  {
    name: 'accordion',
    type: 'stack',
    icons: [
      ...lucide(['plus', 'circle-chevron-left']),
      ...mynaui(['arrow-left-square']),
    ],
  },
  {
    name: 'accordion-horizontal',
    type: 'stack',
    icons: lucide(['footprints', 'snowflake', 'bell']),
  },
];

// Build the SVG files
export const sprites = await buildSvgFiles(config);
```

Then, integrate the generated sprites into your `astro.config.mjs` file:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { serve } from '@astrojs/prerender';
import { sprites } from './src/sprites'; // Import your sprites

export default defineConfig({
  integrations: [
    // ... other integrations
    serve('/sprites', sprites) // Integrate Astro Sprite
  ],
});
```

## License

This project is licensed under the MIT License.