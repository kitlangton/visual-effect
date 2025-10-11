export function createExampleId(name: string, variant?: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return variant ? `${base}-${variant.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : base
}
