export interface ExampleMeta {
  id: string;
  name: string;
  variant?: string;
  description: string;
  section:
    | 'constructors'
    | 'concurrency'
    | 'error handling'
    | 'schedule'
    | 'ref'
    | 'scope'
    | 'chunks'
    | 'streams';
  order?: number;
}

export interface ExampleComponentProps {
  index?: number;
  metadata: ExampleMeta;
  exampleId: string;
}

export interface ExampleItem {
  type: 'example';
  metadata: ExampleMeta;
}

export type AppItem = ExampleItem;
