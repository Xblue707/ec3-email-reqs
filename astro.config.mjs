// @ts-check
import { defineConfig } from 'astro/config';

import alpinejs from '@astrojs/alpinejs';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';
import icon from 'astro-icon';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	site: 'https://email-apps.ec3.dev',
	output: 'server',
	integrations: [
		alpinejs({
			entrypoint: 'src/alpine',
		}),
		vue(),
		tailwind(),
		icon(),
	],
	adapter: node({
		mode: 'standalone',
	}),
	security: {
		checkOrigin: true,
	},
});
