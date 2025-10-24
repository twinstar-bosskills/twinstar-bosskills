import { DB } from "./types";
import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";

const dialect = new MysqlDialect({
  pool: createPool({
    host: process.env.MARIADB_HOST!,
    user: process.env.MARIADB_USER!,
    password: process.env.MARIADB_PASSWORD!,
    database: process.env.MARIADB_DATABASE!,
    connectionLimit: 10,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
