import type { AppItem, ExampleMeta } from "../lib/example-types"
import { examplesManifest, sectionCallouts } from "../lib/examples-manifest"
import { createExampleId } from "./idUtils"

export { createExampleId }

// Build the AppItem array by inserting a callout whenever the section changes
export const appItems: Array<AppItem> = (() => {
  const items: Array<AppItem> = []
  let lastSection: ExampleMeta["section"] | undefined

  for (const meta of examplesManifest) {
    if (meta.section !== lastSection) {
      // If this section has a callout, add it
      const calloutContent = sectionCallouts[meta.section]
      if (calloutContent) {
        items.push({
          type: "callout",
          content: calloutContent,
          section: meta.section,
        })
      }
      lastSection = meta.section
    }

    items.push({ type: "example", metadata: meta })
  }

  return items
})()
