"use client"

import dynamic from "next/dynamic"

const AppContent = dynamic(
  () => import("../src/AppContent").then(mod => ({ default: mod.AppContent })),
  {
    ssr: false,
  },
)

export default function ClientAppContent() {
  return <AppContent />
}
