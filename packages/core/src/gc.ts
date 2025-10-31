export const safeGC = () => {
  try {
    if (global.gc) {
      global.gc();
    }
  } catch (e: any) {
    console.error(e?.message);
  }
};
const formatMemoryUsage = (data: number) =>
  `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
export const memoryUsage = () => {
  const memoryData = process.memoryUsage();
  const memoryUsage = {
    rss: `${formatMemoryUsage(
      memoryData.rss,
    )} -> Resident Set Size - total memory allocated for the process execution`,
    heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
    heapUsed: `${formatMemoryUsage(
      memoryData.heapUsed,
    )} -> actual memory used during the execution`,
    external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
  };
  return memoryUsage;
};
