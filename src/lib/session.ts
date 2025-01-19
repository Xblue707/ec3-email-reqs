import { sha256 } from '@oslojs/crypto/sha2';
import {
	encodeBase32LowerCaseNoPadding,
	encodeHexLowerCase,
} from '@oslojs/encoding';
import { jsonObjectFrom } from 'kysely/helpers/sqlite';
import type { Session, User } from '~/prisma/generated/types';
import { db } from './db';

import type { APIContext } from 'astro';

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(
	token: string,
	userId: string,
): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const data: Session = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
	};

	const session = await db
		.insertInto('Session')
		.values(data)
		.returningAll()
		.executeTakeFirst();

	return session!;
}

export async function validateSessionToken(
	token: string,
): Promise<SessionValidationResult> {
	// TODO
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const result = await db
		.selectFrom('Session')
		.select((eb) => [
			'id',
			'userId',
			'expiresAt',
			jsonObjectFrom(
				eb
					.selectFrom('User')
					.select(['id', 'email', 'expiresAt', 'userId', 'name', 'pictureUrl'])
					.whereRef('User.id', '==', 'Session.userId'),
			).as('user'),
		])
		.where('id', '==', sessionId)
		.executeTakeFirst();

	if (!result || !result?.user) {
		return { session: null, user: null };
	}

	const { user, ...session } = result;

	if (Date.now() > new Date(session.expiresAt).getTime()) {
		await db.deleteFrom('Session').where('id', '==', sessionId).execute();
		return { session: null, user: null };
	}

	if (
		Date.now() >=
		new Date(session.expiresAt).getTime() - 1000 * 60 * 60 * 24 * 15
	) {
		session.expiresAt = new Date(
			Date.now() + 1000 * 60 * 60 * 24 * 30,
		).toISOString();
		await db
			.updateTable('Session')
			.set({
				expiresAt: session.expiresAt,
			})
			.where('id', '==', sessionId)
			.execute();
	}

	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.deleteFrom('Session').where('id', '==', sessionId).execute();
}

export function setSessionTokenCookie(
	context: APIContext,
	token: string,
	expiresAt: string | Date,
): void {
	context.cookies.set('session', token, {
		httpOnly: true,
		sameSite: 'lax',
		secure: import.meta.env.PROD,
		expires: new Date(expiresAt),
		path: '/',
	});
}

export function deleteSessionTokenCookie(context: APIContext): void {
	context.cookies.set('session', '', {
		httpOnly: true,
		sameSite: 'lax',
		secure: import.meta.env.PROD,
		maxAge: 0,
		path: '/',
	});
}

export type SessionValidationResult =
	| { session: Session; user: User }
	| { session: null; user: null };
