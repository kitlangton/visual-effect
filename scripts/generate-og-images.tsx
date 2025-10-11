/* eslint-disable react-refresh/only-export-components */

import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Resvg } from "@resvg/resvg-js"
// biome-ignore lint/correctness/noUnusedImports: We actually need it, liar.
import React from "react"
import satori from "satori"
import { examplesManifest } from "../src/lib/examples-manifest.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// No need for createExampleId anymore - we use the id from meta

// OG Image Component
function OGImage({
  description,
  name,
  variant,
}: {
  name: string
  variant?: string
  description: string
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        fontFamily: "Inter",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 12,
            background: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="32" height="32" fill="white" viewBox="0 0 256 256">
            <path d="M240,128a15.79,15.79,0,0,1-10.5,15l-63.44,23.07L143,229.5a16,16,0,0,1-30,0L89.94,166.06,26.5,143a16,16,0,0,1,0-30L89.94,89.94,113,26.5a16,16,0,0,1,30,0l23.07,63.44L229.5,113A15.79,15.79,0,0,1,240,128Z"></path>
          </svg>
        </div>
        <div
          style={{
            color: "#6b7280",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          VISUAL EFFECT
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <h1
            style={{
              fontSize: 72,
              color: "white",
              margin: 0,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {name}
          </h1>
          {variant && (
            <span
              style={{
                fontSize: 48,
                color: "#6b7280",
                fontWeight: 500,
              }}
            >
              {variant}
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: 32,
            color: "#9ca3af",
            margin: 0,
            lineHeight: 1.4,
            maxWidth: "90%",
          }}
        >
          {description}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 40,
          borderTop: "1px solid #374151",
        }}
      >
        <div style={{ color: "#6b7280", fontSize: 20 }}>Interactive Effect Examples</div>
        <div style={{ color: "#6b7280", fontSize: 20 }}>effect.kitlangton.com</div>
      </div>
    </div>
  )
}

async function generateOGImages() {
  console.log("🎨 Generating Open Graph images...")

  // Ensure output directory exists
  const outputDir = path.join(__dirname, "..", "public", "og")
  await fs.mkdir(outputDir, { recursive: true })

  // Load font
  const interBoldPath = path.join(__dirname, "..", "public", "fonts", "Inter-Bold.ttf")
  const interRegularPath = path.join(__dirname, "..", "public", "fonts", "Inter-Regular.ttf")

  // Check if fonts exist, if not, download them
  let interBold: ArrayBuffer
  let interRegular: ArrayBuffer

  try {
    const boldBuffer = await fs.readFile(interBoldPath)
    const regularBuffer = await fs.readFile(interRegularPath)
    interBold = boldBuffer.buffer.slice(
      boldBuffer.byteOffset,
      boldBuffer.byteOffset + boldBuffer.byteLength,
    ) as ArrayBuffer
    interRegular = regularBuffer.buffer.slice(
      regularBuffer.byteOffset,
      regularBuffer.byteOffset + regularBuffer.byteLength,
    ) as ArrayBuffer
  } catch {
    console.log("⚠️  Fonts not found locally, using system fonts as fallback")
    // Use a minimal font as fallback
    interBold = new ArrayBuffer(0)
    interRegular = new ArrayBuffer(0)
  }

  // Generate all images in parallel
  const imagePromises = examplesManifest.map(async example => {
    const id = example.id
    console.log(`  📸 Generating ${id}.png`)

    try {
      const svg = await satori(
        <OGImage
          name={example.name}
          {...(example.variant ? { variant: example.variant } : {})}
          description={example.description}
        />,
        {
          width: 1200,
          height: 630,
          fonts:
            interBold.byteLength > 0
              ? [
                  {
                    name: "Inter",
                    data: interBold,
                    weight: 700,
                    style: "normal",
                  },
                  {
                    name: "Inter",
                    data: interRegular,
                    weight: 400,
                    style: "normal",
                  },
                ]
              : [],
        },
      )

      const resvg = new Resvg(svg, {
        fitTo: {
          mode: "width",
          value: 1200,
        },
      })

      const pngData = resvg.render()
      const pngBuffer = pngData.asPng()

      await fs.writeFile(path.join(outputDir, `${id}.png`), pngBuffer)

      return { id, success: true }
    } catch (error) {
      console.error(`  ❌ Failed to generate ${id}.png:`, error)
      return { id, success: false, error }
    }
  })

  // Wait for all images to complete
  const results = await Promise.allSettled(imagePromises)

  // Count successes and failures
  const completed = results.filter(r => r.status === "fulfilled").length
  const failed = results.filter(r => r.status === "rejected").length

  if (failed > 0) {
    console.log(`⚠️  ${failed} images failed to generate`)
  }

  console.log(`✅ Generated ${completed} Open Graph images successfully`)
}

// Run the script
generateOGImages().catch(console.error)
