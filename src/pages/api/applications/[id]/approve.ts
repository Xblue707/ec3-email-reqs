import { createId as cuid2 } from '@paralleldrive/cuid2';
import { db } from '@/lib/db';
import { siteConfig } from '@/siteConfig';

import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
	// not implemented
	return new Response(JSON.stringify({
		error: 'Not implemented',
	}), { status: 501 });
}