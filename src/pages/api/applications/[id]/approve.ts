import { db } from '@/lib/db';
import { transporter } from '@/lib/mail';
import { siteConfig } from '@/siteConfig';
import { sha256 } from '@oslojs/crypto/sha2';
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from '@oslojs/encoding';
import { createId as cuid2 } from '@paralleldrive/cuid2';
import ky from 'ky';

import type { APIContext } from 'astro';
import { dedent } from '@/lib/util';

export async function POST(context: APIContext) {
	const session = context.locals.session;
	const user = context.locals.user;

	if (!session) {
		return new Response(
			JSON.stringify({
				status: 401,
				body: { error: 'Unauthorized' },
			}),
			{
				status: 401,
				headers: {
					'content-type': 'application/json',
				},
			},
		);
	}
	if (!siteConfig.adminEmails.includes(user?.email || '')) {
		return new Response(
			JSON.stringify({
				status: 403,
				body: { error: 'Forbidden' },
			}),
			{
				status: 403,
				headers: {
					'content-type': 'application/json',
				},
			},
		);
	}

	const { id } = context.params;
	console.log('Approving application', id);

	const application = await db
		.selectFrom('EmailApplication')
		.selectAll()
		.where('id', '==', id!)
		.executeTakeFirst();

	if (!application) {
		return {
			status: 404,
			body: { error: 'Not found' },
		};
	}

	const applicant = await db
		.selectFrom('User')
		.select(['id', 'name', 'email'])
		.where('id', '==', application.userId)
		.executeTakeFirst();

	if (!applicant) {
		return {
			status: 404,
			body: { error: 'Not found' },
		};
	}

	const bytes = new Uint8Array(35);
	crypto.getRandomValues(bytes);
	const passwordResetToken = encodeBase32LowerCaseNoPadding(bytes);

	const tokenHash = encodeHexLowerCase(
		sha256(new TextEncoder().encode(passwordResetToken)),
	);

	await db
		.insertInto('ResetToken')
		.values({
			id: cuid2(),
			userId: applicant.id,
			tokenHash: tokenHash,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
		})
		.returningAll()
		.executeTakeFirst();

	const siteUrl = import.meta.env.PROD
		? import.meta.env.SITE
		: 'http://localhost:4321';
	const resetUrl = `${siteUrl}/reset-password/${passwordResetToken}/`;

	// create dummy temporary password
	// i actually don't even need to do this
	const tmpPasswordBytes = new Uint8Array(15);
	crypto.getRandomValues(tmpPasswordBytes);
	const tmpPassword = encodeBase32LowerCaseNoPadding(tmpPasswordBytes);

	/*
	{
		"userName": "string",
		"domainName": "string",
		"password": "string",
		"enablePasswordReset": true,
		"recoveryEmail": "string",
		"recoveryEmailDescription": "string",
		"recoveryPhone": "string",
		"recoveryPhoneDescription": "string",
		"enableSearchIndexing": true,
		"sendWelcomeEmail": true
	}
	*/
	const data = {
		userName: application.username,
		domainName: 'ec3.dev',
		password: tmpPassword,
		enablePasswordReset: true,
		recoveryEmail: application.recoveryEmail,
		recoveryEmailDescription: application.recoveryEmailDescription,
		sendWelcomeEmail: true,
		enableSearchIndexing: true,
		...(application.recoveryPhone && {
			recoveryPhone: application.recoveryPhone,
		}),
		...(application.recoveryPhoneDescription && application.recoveryPhone
			? { recoveryPhoneDescription: application.recoveryPhoneDescription }
			: {}),
	};

	const res = await ky
		.post('https://purelymail.com/api/v0/createUser', {
			json: data,
			headers: {
				'Purelymail-Api-Token': import.meta.env.PURELYMAIL_API_KEY,
			},
		})
		.json<PurelyMailAPIResponse>();

	if (res.type === 'error') {
		console.error('Error creating account', res);
		return new Response(JSON.stringify(res), {
			status: 500,
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	const emailInfo = await transporter.sendMail({
		from: `"EC3 Email Address Portal" <${import.meta.env.EMAIL_USER}>`,
		to: applicant?.email || application.recoveryEmail,
		subject: 'ec3.dev Email Address Approved',
		text: dedent(`
			Dear ${applicant?.name || 'Applicant'},

			Your application for an email address on ec3.dev has been approved.

			Here are your account details:
			- Email: ${application.username}@ec3.dev

			Please visit the following link to set your password:
			${resetUrl}

			The link expires in 2 days.

			Please contact an administrator if you have any questions.

			- HCI EC³
		`),
	});

	await db
		.updateTable('EmailApplication')
		.where('id', '==', id as string)
		.set({
			approved: 1,
		})
		.execute();

	return context.redirect('/manage');
}

type PurelyMailAPIResponse = {
	type: 'error' | 'success';
	code?: string;
	message?: string;
	result?: object;
};
