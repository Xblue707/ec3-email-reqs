import { deleteSessionTokenCookie, invalidateSession } from '@/lib/session';

import type { APIContext } from 'astro';

export async function ALL(context: APIContext) {
	const { session } = context.locals;

	if (session === null) {
		return new Response('Not logged in', {
			status: 401,
		});
	}

	await invalidateSession(session.id);
	deleteSessionTokenCookie(context);

	return context.redirect('/');
}
