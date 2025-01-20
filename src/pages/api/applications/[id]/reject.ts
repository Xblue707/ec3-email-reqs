import { createId as cuid2 } from '@paralleldrive/cuid2';
import { db } from '@/lib/db';
import { siteConfig } from '@/siteConfig';

import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
	const session = context.locals.session;
	const user = context.locals.user;
	if (!session) {
		return new Response(JSON.stringify({
			error: 'Not logged in',
		}), {
			status: 401,
		});
	}
	if (!siteConfig.adminEmails.includes(user?.email!)) {
		return new Response(JSON.stringify({
			error: 'Not authorized',
		}), {
			status: 403,
		});
	}

	const id = context.params.id;
}