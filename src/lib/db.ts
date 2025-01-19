import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import type { DB } from '~/prisma/generated/types';

const dialect = new SqliteDialect({
	database: new SQLite('prisma/db.sqlite'),
});

export const db = new Kysely<DB>({
	dialect,
});
