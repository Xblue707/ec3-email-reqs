import { addDynamicIconSelectors } from '@iconify/tailwind';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [
		daisyui,
		addDynamicIconSelectors({
			scale: 0,
		}),
	],
	daisyui: {
		themes: ['dracula'],
	},
};
