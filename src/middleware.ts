import { defineMiddleware } from 'astro:middleware';
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	validateSessionToken,
} from './lib/session';

export const onRequest = defineMiddleware(async (context, next) => {
	const token = context.cookies.get('session')?.value ?? null;
	if (token === null) {
		context.locals.user = null;
		context.locals.session = null;
		return next();
	}

	const { session, user } = await validateSessionToken(token);
	if (session) {
		setSessionTokenCookie(context, token, session.expiresAt);
	} else {
		deleteSessionTokenCookie(context);
	}

	context.locals.session = session;
	context.locals.user = user;
	return next();
});
