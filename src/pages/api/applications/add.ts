import { createId as cuid2 } from '@paralleldrive/cuid2';
import { db } from '@/lib/db';

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

	const formData = await context.request.formData();
	const data = Object.fromEntries(formData);

	console.log(data);

	const result = await db.insertInto('EmailApplication')
		.values({
			id: cuid2(),
			userId: user?.id!,
			username: data.username as string,
			recoveryEmail: data.recoveryEmail as string,
			recoveryEmailDescription: data.recoveryEmailDesc as string,
			approved: 0,
		})
		.returningAll()
		.executeTakeFirst();

	console.log(result);

	return context.redirect('/');
}