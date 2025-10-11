import type { RenderableResult } from "./RenderableResult"

// Simple number renderer
export class NumberResult implements RenderableResult {
  constructor(public value: number) {}

  render() {
    return <div className="text-white font-mono text-xl">{this.value}</div>
  }
}

// Simple string renderer
export class StringResult implements RenderableResult {
  constructor(public value: string) {}

  render() {
    return <div className="text-white font-mono text-xl">{this.value}</div>
  }
}

// Boolean renderer
export class BooleanResult implements RenderableResult {
  constructor(public value: boolean) {}

  render() {
    return <div className="text-white font-mono">{this.value ? "true" : "false"}</div>
  }
}

// Object/JSON renderer
export class ObjectResult implements RenderableResult {
  constructor(public value: unknown) {}

  render() {
    return <div className="text-white font-mono text-xs">{JSON.stringify(this.value, null, 2)}</div>
  }
}
