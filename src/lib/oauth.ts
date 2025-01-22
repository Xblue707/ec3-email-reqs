import { Google } from 'arctic';

const siteUrl = import.meta.env.PROD
	? import.meta.env.SITE
	: 'http://localhost:4321';

export const google = new Google(
	import.meta.env.GOOGLE_CLIENT_ID,
	import.meta.env.GOOGLE_CLIENT_SECRET,
	`${siteUrl}/api/login/google/callback`,
);
