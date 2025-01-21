import { db } from '@/lib/db';
import { createId as cuid2 } from '@paralleldrive/cuid2';

import type { APIContext } from 'astro';

export async function POST(context: APIContext) {
	const session = context.locals.session;
	const user = context.locals.user;
	if (!session) {
		return new Response(
			JSON.stringify({
				error: 'Not logged in',
			}),
			{
				status: 401,
			},
		);
	}

	const formData = await context.request.formData();
	const data = Object.fromEntries(formData);

	if (!data.username || !data.recoveryEmail || !data.recoveryEmailDesc) {
		return new Response(
			JSON.stringify({
				error: 'Missing required fields',
			}),
			{
				status: 400,
			},
		);
	}

	console.log(data);

	const result = await db
		.insertInto('EmailApplication')
		.values({
			id: cuid2(),
			userId: user?.id!,
			username: data.username as string,
			recoveryEmail: data.recoveryEmail as string,
			recoveryEmailDescription: data.recoveryEmailDesc as string,
			...(data.recoveryPhone && {
				recoveryPhone: data.recoveryPhone as string,
			}),
			...(data.recoveryPhoneDesc &&
				data.recoveryPhone && {
					recoveryPhoneDescription: data.recoveryPhoneDesc as string,
				}),
			approved: 0,
		})
		.returningAll()
		.executeTakeFirst();

	console.log(result);

	return context.redirect('/');
}
