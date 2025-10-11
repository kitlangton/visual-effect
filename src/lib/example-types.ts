export interface ExampleMeta {
  id: string
  name: string
  variant?: string
  description: string
  section: "constructors" | "concurrency" | "error handling" | "schedule" | "ref" | "scope"
  order?: number
}

export interface ExampleComponentProps {
  index?: number
  metadata: ExampleMeta
  exampleId: string
}

export interface InfoCalloutItem {
  type: "callout"
  content: string
  section: ExampleMeta["section"]
}

export interface ExampleItem {
  type: "example"
  metadata: ExampleMeta
}

export type AppItem = ExampleItem | InfoCalloutItem
