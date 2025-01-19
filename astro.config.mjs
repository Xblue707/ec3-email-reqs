// @ts-check
import { defineConfig } from 'astro/config';

import alpinejs from '@astrojs/alpinejs';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	integrations: [alpinejs(), vue(), tailwind()],

	adapter: node({
		mode: 'standalone',
	}),
});
