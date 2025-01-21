interface Window {
	Alpine: import('alpinejs').Alpine;
}

interface ImportMetaEnv {
	readonly GOOGLE_CLIENT_ID: string;
	readonly GOOGLE_CLIENT_SECRET: string;
	readonly PURELYMAIL_API_KEY: string;
	readonly EMAIL_USER: string;
	readonly EMAIL_PASS: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

/// <reference types="astro/client" />
declare namespace App {
	// Note: 'import {} from ""' syntax does not work in .d.ts files.
	interface Locals {
		session: import('~/prisma/generated/types').Session | null;
		user: import('~/prisma/generated/types').User | null;
	}
}
