import { createDragonflyClient } from "../dragonfly";

let r = 0;
try {
  const client = createDragonflyClient();
  await client.flushall();
  console.log("Done");
  await client.disconnect();
} catch (e) {
  console.error(e);
  r = 1;
}
process.exit(r);
