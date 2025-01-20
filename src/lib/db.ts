import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import type { DB } from '~/prisma/generated/types';

const dialect = new SqliteDialect({
	database: new SQLite('prisma/db.sqlite'),
});

export const db = new Kysely<DB>({
	plugins: [new ParseJSONResultsPlugin()],
	dialect,
});
