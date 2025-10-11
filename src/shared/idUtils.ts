function normalizeSegment(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createExampleId(name: string, variant?: string): string {
  const base = normalizeSegment(name)
  return variant ? `${base}-${normalizeSegment(variant)}` : base
}
