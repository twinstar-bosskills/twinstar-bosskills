import dotenv from "dotenv";
const cfg = dotenv.config();

export const TWINSTAR_API_URL = cfg.parsed?.TWINSTAR_API_URL;
