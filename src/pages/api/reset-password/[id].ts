import { db } from '@/lib/db';
import { transporter } from '@/lib/mail';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import ky from 'ky';

import type { APIContext } from 'astro';
import { dedent } from '@/lib/util';

export async function POST(context: APIContext) {
	const session = context.locals.session;
	const user = context.locals.user!;

	if (!session) {
		return context.redirect('/');
	}

	const { id } = context.params;

	const tokenHash = encodeHexLowerCase(
		sha256(new TextEncoder().encode(id as string)),
	);

	const passwordResetTokenEntry = await db
		.selectFrom('ResetToken')
		.where('tokenHash', '==', tokenHash)
		.selectAll()
		.executeTakeFirst();

	if (!passwordResetTokenEntry) {
		return context.redirect('/portal');
	}

	const expiryDate = new Date(passwordResetTokenEntry.expiresAt);

	if (expiryDate < new Date()) {
		await db
			.deleteFrom('ResetToken')
			.where('id', '==', passwordResetTokenEntry.id)
			.execute();
		return context.redirect('/portal');
	}

	const userEntry = await db
		.selectFrom('User')
		.where('id', '==', passwordResetTokenEntry.userId)
		.selectAll()
		.executeTakeFirst();

	if (user.email !== userEntry?.email) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	const emailApplication = await db
		.selectFrom('EmailApplication')
		.selectAll()
		.where('id', '==', passwordResetTokenEntry.emailApplicationId)
		.executeTakeFirst();

	if (!emailApplication) {
		return new Response(JSON.stringify({ error: 'Email application not found' }), {
			status: 404,
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	const formData = await context.request.formData();
	const data = Object.fromEntries(formData.entries());

	if (data.password !== data.confirmPassword) {
		return new Response(JSON.stringify({ error: 'Passwords do not match' }), {
			status: 400,
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	await db
		.updateTable('EmailApplication')
		.set({
			password: 'Has been reset',
		})
		.where('username', '==', passwordResetTokenEntry.emailApplicationId)
		.execute();

	const res = await ky
		.post('https://purelymail.com/api/v0/modifyUser', {
			json: {
				userName: `${emailApplication?.username}@ec3.dev`,
				newPassword: data.password,
			},
			headers: {
				'Purelymail-Api-Token': import.meta.env.PURELYMAIL_API_KEY,
			},
		})
		.json<PurelyMailAPIResponse>();

	console.log(res);

	if (res.type === 'error') {
		console.error(res);
		return new Response(JSON.stringify(res), {
			status: 500,
			headers: {
				'content-type': 'application/json',
			},
		});
	}

	const emailInfo = await transporter.sendMail({
		from: `"EC3 Email Address Portal" <${import.meta.env.EMAIL_USER}>`,
		to: userEntry.email || emailApplication.recoveryEmail,
		subject: 'ec3.dev Password Changed',
		text: dedent(`
			Dear ${userEntry?.name || 'Applicant'},

			Your password for ${emailApplication.username}@ec3.dev has been successfully changed. If you did not request this change, please contact us immediately.

			If not, you can now log in to your email account using your new password at https://purelymail.com/user/login, or any other suitable email client that supports IMAP/SMTP.

			- HCI EC³
		`)
	});

	console.log(emailInfo);

	return context.redirect('/portal');
}

type PurelyMailAPIResponse = {
	type: 'error' | 'success';
	code?: string;
	message?: string;
	result?: object;
};
