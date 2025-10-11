import { LightbulbFilamentIcon } from "@phosphor-icons/react"
import { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface InfoCalloutProps {
  children: string
}

function InfoCalloutComponent({ children }: InfoCalloutProps) {
  return (
    <div
      className="bg-neutral-900/50 border border-amber-500/15 rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <LightbulbFilamentIcon weight="fill" size={24} className="text-amber-400" />
        </div>
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="text-neutral-400 text-base leading-relaxed mb-2 last:mb-0">
                  {children}
                </p>
              ),
              code: ({ children }) => <code className="text-amber-400 text-base">{children}</code>,
              strong: ({ children }) => <strong className="text-amber-400">{children}</strong>,
              em: ({ children }) => <em className="text-neutral-300">{children}</em>,
            }}
          >
            {children}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export const InfoCallout = memo(InfoCalloutComponent)
