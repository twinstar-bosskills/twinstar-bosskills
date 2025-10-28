import { config } from "dotenv";
import findConfig from "find-config";
import { CompiledQuery, Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import fs from "node:fs";
import { Umzug } from "umzug";
import { DB } from "./types";

const cfg = config({ path: findConfig(".env")! });

(async () => {
  const db = new Kysely<DB>({
    dialect: new MysqlDialect({
      pool: createPool({
        host: cfg.parsed?.MARIADB_HOST!,
        user: "root",
        password: cfg.parsed?.MARIADB_ROOT_PASSWORD!,
        database: "mysql",
        connectionLimit: 1,
        multipleStatements: true,
      }),
    }),
  });

  const CREATE_BOSSKILLS_DATABASE = "CREATE DATABASE IF NOT EXISTS `bosskills`";
  const CREATE_MIGRATIONS_TABLE =
    "CREATE TABLE IF NOT EXISTS bosskills.migrations(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, executed_at TIMESTAMP NOT NULL)";

  await db.executeQuery(CompiledQuery.raw(CREATE_BOSSKILLS_DATABASE));
  await db.executeQuery(CompiledQuery.raw(CREATE_MIGRATIONS_TABLE));
  await db.destroy();
})();

const db = new Kysely<DB>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: cfg.parsed?.MARIADB_HOST!,
      user: "root",
      password: cfg.parsed?.MARIADB_ROOT_PASSWORD!,
      database: cfg.parsed?.MARIADB_DATABASE!,
      connectionLimit: 1,
      multipleStatements: true,
    }),
  }),
});

const umzug = new Umzug({
  migrations: {
    glob: "migrations_mysql/*.sql",
    resolve: ({ name, path }) => ({
      name,
      up: async () => {
        if (!path) {
          throw new Error(`Migration ${name} has no path`);
        }

        const sql = fs.readFileSync(path).toString();
        return db.transaction().execute(async (tx) => {
          return await tx.executeQuery(CompiledQuery.raw(sql));
        });
      },
      down: async () => {
        // we don't do that here
      },
    }),
  },
  storage: {
    executed: async () => {
      const rows = await db.selectFrom("migrations").selectAll().execute();
      console.log(rows);
      return rows.map((row) => row.name);
    },
    logMigration: async ({ name }) => {
      await db.transaction().execute(async (trx) => {
        return await trx
          .insertInto("migrations")
          .values({ name, executed_at: new Date() })
          .execute();
      });
    },
    unlogMigration: async () => {
      // we don't do that here
    },
  },
  create: {
    folder: "migrations_mysql",
  },
  context: undefined,
  logger: console,
});

await umzug.runAsCLI().then(() => db.destroy());
