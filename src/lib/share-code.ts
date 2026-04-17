// invite codes (6 char) and verdict slugs

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I,L,O,0,1 — easier to type

export function generateShareCode(): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function generateVerdictSlug(): string {
  // 12 char url-safe random string
  const url = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 12; i += 1) {
    out += url[Math.floor(Math.random() * url.length)];
  }
  return out;
}
