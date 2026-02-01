/**
 * SQL EXECUTOR
 * Выполнение SQL через прямое подключение к Postgres
 */

// Используем Deno postgres
import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

let sql: ReturnType<typeof postgres> | null = null;

function getConnection() {
  if (!sql) {
    const databaseUrl = Deno.env.get("SUPABASE_DB_URL") || Deno.env.get("DATABASE_URL");

    if (!databaseUrl) {
      throw new Error("DATABASE_URL not available");
    }

    sql = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

export async function executeSQL(query: string): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const conn = getConnection();
    const result = await conn.unsafe(query);
    return { success: true, data: result };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Игнорируем ошибки "already exists"
    if (
      errorMsg.includes("already exists") ||
      errorMsg.includes("duplicate") ||
      errorMsg.includes("SQLSTATE 42P07") ||
      errorMsg.includes("SQLSTATE 42710")
    ) {
      return { success: true, data: "skipped (already exists)" };
    }

    return { success: false, error: errorMsg };
  }
}

export async function executeSQLStatements(statements: string[]): Promise<{
  success: boolean;
  successCount: number;
  totalCount: number;
  errors: Array<{ statement: string; error: string }>;
}> {
  const errors: Array<{ statement: string; error: string }> = [];
  let successCount = 0;

  for (const statement of statements) {
    const trimmed = statement.trim();
    if (!trimmed || trimmed.startsWith("--")) continue;

    const result = await executeSQL(trimmed + ";");

    if (result.success) {
      successCount++;
    } else {
      errors.push({
        statement: trimmed.substring(0, 100),
        error: result.error || "Unknown error",
      });
    }
  }

  return {
    success: errors.length === 0,
    successCount,
    totalCount: statements.length,
    errors,
  };
}

export async function closeConnection() {
  if (sql) {
    await sql.end();
    sql = null;
  }
}
