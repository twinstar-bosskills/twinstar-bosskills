import Redis from "ioredis";
import { config } from "dotenv";
import findConfig from "find-config";
const cfg = config({ path: findConfig(".env")! });
let globalDf: Redis | null = null;
export const createDragonflyClient = () => {
  if (globalDf === null) {
    globalDf = new Redis({
      host: cfg.parsed?.DRAGONFLY_HOST!,
      port: Number(cfg.parsed?.DRAGONFLY_PORT!),
      connectTimeout: 1_000,
    });
  }
  return globalDf!;
};
