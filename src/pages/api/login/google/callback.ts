import { db } from '@/lib/db';
import { google } from '@/lib/oauth';
// pages/login/google/callback.ts
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
} from '@/lib/session';
import { createId as cuid2 } from '@paralleldrive/cuid2';
import { decodeIdToken } from 'arctic';

import type { OAuth2Tokens } from 'arctic';
import type { APIContext } from 'astro';

export async function GET(context: APIContext): Promise<Response> {
	const code = context.url.searchParams.get('code');
	const state = context.url.searchParams.get('state');
	const storedState = context.cookies.get('google_oauth_state')?.value ?? null;
	const codeVerifier =
		context.cookies.get('google_code_verifier')?.value ?? null;
	if (
		code === null ||
		state === null ||
		storedState === null ||
		codeVerifier === null
	) {
		return new Response(null, {
			status: 400,
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400,
		});
	}
	const claims = decodeIdToken(tokens.idToken()) as any;
	const googleEmail = claims.email;

	console.log('Google User ID:', claims);

	// return new Response(null, {
	// 	status: 200
	// });

	const existingUser = await db
		.selectFrom('User')
		.selectAll()
		.where('email', '==', googleEmail)
		.executeTakeFirst();

	if (existingUser) {
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(context, sessionToken, session.expiresAt);
		return context.redirect('/');
	}

	// check if user is within organization
	const domain = googleEmail.split('@')[1];

	// create user if not exists
	const user = await db
		.insertInto('User')
		.values({
			id: cuid2(),
			email: googleEmail,
		})
		.returningAll()
		.executeTakeFirst();

	const sessionToken = generateSessionToken();
	const session = await createSession(sessionToken, user!.id);
	setSessionTokenCookie(context, sessionToken, session.expiresAt);
	return context.redirect('/');
}
