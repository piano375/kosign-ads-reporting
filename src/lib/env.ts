import "server-only";

import os from "node:os";
import path from "node:path";
import { z } from "zod";

const schema = z.object({
  // Local development reads from the private file. Hosted environments use META_SYSTEM_TOKEN instead.
  META_SYSTEM_TOKEN_FILE: z.string().min(1).default(path.join(os.homedir(), "Vault Credentials", "meta-system-token.txt")),
  META_AD_ACCOUNT_ID: z.string().regex(/^act_\d+$/).default("act_617887027795895"),
  META_GRAPH_API_VERSION: z.string().regex(/^v\d+\.\d+$/).default("v21.0"),
  META_ACCOUNT_TIMEZONE: z.literal("America/Los_Angeles").default("America/Los_Angeles"),
  META_CACHE_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(1800),
});

export type ServerConfig = z.infer<typeof schema>;

export function getServerConfig(): ServerConfig {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Dashboard server configuration is invalid. Check non-secret Meta configuration values.");
  }
  return parsed.data;
}
