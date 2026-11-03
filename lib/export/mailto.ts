/** Lane: export. Build a mailto: link with proper encoding. */
export function buildMailto(to: string | undefined, subject: string, body: string): string {
  const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${to ? encodeURIComponent(to).replace(/%40/g, "@") : ""}?${params}`;
}
