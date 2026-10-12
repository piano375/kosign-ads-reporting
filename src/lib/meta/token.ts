import { readFile } from "node:fs/promises";

type TokenEnvironment = {
  META_SYSTEM_TOKEN?: string;
  META_SYSTEM_TOKEN_FILE?: string;
};

function unavailable() {
  return new Error("Meta reporting is temporarily unavailable. No credentials or upstream response details are exposed.");
}

export async function resolveMetaToken(environment: TokenEnvironment): Promise<string> {
  const deploymentToken = environment.META_SYSTEM_TOKEN?.trim();
  if (deploymentToken) return deploymentToken;

  const file = environment.META_SYSTEM_TOKEN_FILE;
  if (!file) throw unavailable();
  try {
    const token = (await readFile(file, "utf8")).trim();
    if (!token) throw new Error("blank token");
    return token;
  } catch {
    throw unavailable();
  }
}
