import { format } from "sql-formatter";

/**
 * SQL formatting is delegated to sql-formatter (pure JS, no network). This
 * module is the platform's thin, tested seam around it: it owns the language
 * list the UI offers and the empty-input contract the shared text tools rely
 * on.
 */
export const SQL_LANGUAGES = [
  "sql",
  "mysql",
  "mariadb",
  "postgresql",
  "transactsql",
  "plsql",
  "redshift",
  "bigquery",
  "snowflake",
  "spark",
  "db2",
  "sqlite",
] as const;

export type SqlLanguage = (typeof SQL_LANGUAGES)[number];

const LABELS: Record<SqlLanguage, string> = {
  sql: "Generic SQL",
  mysql: "MySQL",
  mariadb: "MariaDB",
  postgresql: "PostgreSQL",
  transactsql: "T-SQL",
  plsql: "PL/SQL (Oracle)",
  redshift: "Amazon Redshift",
  bigquery: "BigQuery",
  snowflake: "Snowflake",
  spark: "Spark SQL",
  db2: "DB2",
  sqlite: "SQLite",
};

export function sqlLanguageLabel(language: SqlLanguage): string {
  return LABELS[language] ?? language;
}

export type SqlFormatOptions = {
  language?: SqlLanguage;
  /** Two spaces (default) or a tab. */
  useTabs?: boolean;
  uppercase?: boolean;
};

export function formatSql(input: string, options: SqlFormatOptions = {}): string {
  if (!input.trim()) return "";
  const { language = "sql", useTabs = false, uppercase = false } = options;
  try {
    return format(input, {
      language,
      keywordCase: uppercase ? "upper" : "preserve",
      tabWidth: 2,
      useTabs,
    });
  } catch (error) {
    // sql-formatter throws on genuinely unparsable dialect-specific syntax;
    // surface its message rather than a stack trace.
    throw new Error(error instanceof Error ? error.message : "This SQL could not be formatted.");
  }
}
