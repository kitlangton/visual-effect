import type { AppItem } from "../lib/example-types"
import { examplesManifest } from "../lib/examples-manifest"
import { createExampleId } from "./idUtils"

export { createExampleId }

export const appItems: Array<AppItem> = examplesManifest.map(meta => ({
  type: "example",
  metadata: meta,
}))
