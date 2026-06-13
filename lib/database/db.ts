import { Pool, type QueryResultRow } from "pg";

declare global {
	var postgresPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL nao configurada.");
}

export const db =
	globalThis.postgresPool ??
	new Pool({
		connectionString,
	});

if (process.env.NODE_ENV !== "production") {
	globalThis.postgresPool = db;
}

export type DbResult<T> = {
	data: T[] | null;
	error: Error | null;
};

export type DbSingleResult<T> = {
	data: T | null;
	error: Error | null;
};

export async function queryRows<T extends QueryResultRow = QueryResultRow>(
	text: string,
	values: unknown[] = []
): Promise<DbResult<T>> {
	try {
		const result = await db.query<T>(text, values);

		return { data: result.rows, error: null };
	} catch (error) {
		return { data: null, error: toError(error) };
	}
}

export async function queryMaybeSingle<T extends QueryResultRow = QueryResultRow>(
	text: string,
	values: unknown[] = []
): Promise<DbSingleResult<T>> {
	try {
		const result = await db.query<T>(text, values);

		return { data: result.rows[0] ?? null, error: null };
	} catch (error) {
		return { data: null, error: toError(error) };
	}
}

export async function executeQuery(
	text: string,
	values: unknown[] = []
): Promise<{ error: Error | null }> {
	try {
		await db.query(text, values);

		return { error: null };
	} catch (error) {
		return { error: toError(error) };
	}
}

function toError(error: unknown) {
	return error instanceof Error ? error : new Error("Erro inesperado no banco de dados.");
}
