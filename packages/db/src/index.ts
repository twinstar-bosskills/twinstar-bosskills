import { config } from "dotenv";
import findConfig from "find-config";
import { DB } from "./types";
import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";

const cfg = config({ path: findConfig(".env")! });
const dialect = new MysqlDialect({
  pool: createPool({
    host: cfg.parsed?.MARIADB_HOST!,
    user: cfg.parsed?.MARIADB_USER!,
    password: cfg.parsed?.MARIADB_PASSWORD!,
    database: cfg.parsed?.MARIADB_DATABASE!,
    connectionLimit: 10,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});

export * from "kysely";
