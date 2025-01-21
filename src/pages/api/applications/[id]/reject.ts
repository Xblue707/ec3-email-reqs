import { db } from '@/lib/db';
import { transporter } from '@/lib/mail';
import { dedent } from '@/lib/util';
import { siteConfig } from '@/siteConfig';
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
	if (!siteConfig.adminEmails.includes(user?.email!)) {
		return new Response(
			JSON.stringify({
				error: 'Not authorized',
			}),
			{
				status: 403,
			},
		);
	}

	const id = context.params.id as string;

	const application = await db
		.selectFrom('EmailApplication')
		.selectAll()
		.where('id', '==', id)
		.executeTakeFirst();

	if (!application) {
		return new Response(
			JSON.stringify({
				error: 'Application not found',
			}),
			{
				status: 404,
			},
		);
	}

	const applicationUser = await db
		.selectFrom('User')
		.select(['name', 'email'])
		.where('id', '==', application.userId)
		.executeTakeFirst();

	const formData = await context.request.formData();
	const data = Object.fromEntries(formData);

	const rejectionReason = data.rejectionReason as string;

	const recoveryEmail = application.recoveryEmail;

	const sender = import.meta.env.EMAIL_USER;

	console.log(`Sending rejection email to ${recoveryEmail} from ${sender}`);

	const emailInfo = await transporter.sendMail({
		from: `"EC3 Email Address Portal" <${sender}>`,
		to: applicationUser?.email || recoveryEmail,
		subject: 'ec3.dev Email Application Rejected',
		text: dedent(`
			Dear ${applicationUser?.name || 'Applicant'},

			Your application for an email address on ec3.dev has been rejected.

			Reason:
			${rejectionReason}

			Here are more details about the application that was rejected:
			- Requested Email: ${application.username}@ec3.dev
			- Recovery Email: ${recoveryEmail || 'Unknown'}
			- Recovery Phone: ${application.recoveryPhone || 'Not Set'}

			Please contact an administrator if you have any questions.

			- HCI EC³
		`),
	});

	console.log(emailInfo);

	const deletedApplication = await db
		.deleteFrom('EmailApplication')
		.where('id', '==', id)
		.returningAll()
		.execute();

	return context.redirect('/manage/');
}
