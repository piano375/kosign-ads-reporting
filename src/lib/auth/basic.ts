function encode(value: string) {
  return btoa(value);
}

export function isAuthorized(header: string | null, username: string, password: string) {
  if (!header?.startsWith("Basic ")) return false;
  const expected = `Basic ${encode(`${username}:${password}`)}`;
  if (header.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < header.length; index += 1) mismatch |= header.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0;
}
