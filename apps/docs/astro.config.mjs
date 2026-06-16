// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from 'starlight-theme-rapide'

export default defineConfig({
	site: 'https://er-28.github.io',
	base: '/nestjs-response-wrapper',
	integrations: [
		starlight({
			plugins: [starlightThemeRapide()],
			title: 'NestJS Response Wrapper',
			description: 'A professional response standardization library for NestJS',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ER-28/nestjs-response-wrapper' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Configuration', slug: 'guides/configuration' },
						{ label: 'Response Format', slug: 'guides/response-format' },
						{ label: 'Exception Handling', slug: 'guides/exception-handling' },
						{ label: 'Skipping the Wrapper', slug: 'guides/skipping-the-wrapper' },
						{ label: 'Pagination', slug: 'guides/pagination' },
						{ label: 'Response Service', slug: 'guides/response-service' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'API Reference', slug: 'reference/api' },
						{ label: 'Interfaces', slug: 'reference/interfaces' },
					],
				},
			],
		}),
	],
});
