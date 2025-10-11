"use client"

import { motion } from "motion/react"
import type { RenderableResult } from "./RenderableResult"

export class ArrayResult<T> implements RenderableResult {
  constructor(public values: Array<T>) {}

  render() {
    return (
      <motion.span
        key="array"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ fontSize: 12 }}
      >
        [{this.values.length}]
      </motion.span>
    )
  }
}
