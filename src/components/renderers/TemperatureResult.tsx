import type { RenderableResult } from "./RenderableResult"

export class TemperatureResult implements RenderableResult {
  constructor(
    public value: number,
    public location?: string,
  ) {}

  render() {
    return (
      <div key="temp" className="text-xl">
        {this.value}°
      </div>
    )
  }
}

export class TemperatureArrayResult implements RenderableResult {
  constructor(public values: Array<number>) {}

  render() {
    return (
      <div key="array" className="text-xl">
        [{this.values.map(t => `${t}°`).join(", ")}]
      </div>
    )
  }
}
