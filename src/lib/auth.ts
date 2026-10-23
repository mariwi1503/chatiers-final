/** Format checks only: no account lookup or verification for the demo. */
export function isValidLoginIdentifier(value: string): boolean {
  const identifier = value.trim();
  if (identifier.includes("@")) return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(identifier);
  // Accept local/international numbers, with optional spaces or hyphens.
  if (!/^\+?\d+(?:[ -]\d+)*$/.test(identifier)) return false;
  const digits = identifier.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}
