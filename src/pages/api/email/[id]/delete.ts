import { db } from '@/lib/db';
import { transporter } from '@/lib/mail';
import { siteConfig } from '@/siteConfig';

import type { APIContext } from 'astro';
import ky from 'ky';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import { dedent } from '@/lib/util';

export async function POST(context: APIContext) {
	const session = context.locals.session;
	const user = context.locals.user!;
	const { id } = context.params;

	if (!session) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'content-type': 'application/json',
			},
		});
	}
	if (!siteConfig.adminEmails.includes(user.email)) {
		// check if emailapplication user is the one sending the request
		// if not, return unauthorized
		const emailApplicationWithUser = await db
			.selectFrom('EmailApplication')
			.select((eb) => [
				'username',
				jsonObjectFrom(
					eb.selectFrom('User').select([
						'email',
					]).whereRef('User.id', '==', 'userId'),
				).as('applicant'),
			])
			.where('id', '==', id as string)
			.executeTakeFirst();

		// console.log(emailApplicationWithUser);

		if (emailApplicationWithUser?.applicant?.email !== user.email) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: {
					'content-type': 'application/json',
				},
			});
		}
	}

	const emailApplication = await db
		.selectFrom('EmailApplication')
		.where('id', '==', id as string)
		.selectAll()
		.executeTakeFirst();

	if (!emailApplication) {
		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	const res = await ky.post('https://purelymail.com/api/v0/deleteUser', {
		json: {
			userName: `${emailApplication.username}@ec3.dev`,
		},
		headers: {
			'Purelymail-Api-Token': import.meta.env.PURELYMAIL_API_KEY,
		},
	})
	.json<PurelyMailAPIResponse>();

	if (res.type === 'error') {
		console.error('Error deleting account', res);
		return new Response(JSON.stringify(res), {
			status: 400,
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	await db
		.deleteFrom('EmailApplication')
		.where('id', '==', id as string)
		.execute();

	const emailInfo = await transporter.sendMail({
			from: `"EC3 Email Address Portal" <${import.meta.env.EMAIL_USER}>`,
			to: user.email || emailApplication.recoveryEmail,
			subject: 'ec3.dev Email Address Deleted',
			text: dedent(`
				Dear ${user?.name || 'Applicant'},
	
				Your email address (${emailApplication.username}@ec3.dev) has been deleted.

				If you did not request this, please contact us immediately.

				- HCI EC³
			`),
		});

	return context.redirect('/portal');
}

type PurelyMailAPIResponse = {
	type: 'error' | 'success';
	code?: string;
	message?: string;
	result?: object;
};
