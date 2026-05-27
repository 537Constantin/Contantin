import * as React from "react";

/** Minimal, safe markdown-ish renderer (bold, inline code, lists). No HTML injection. */
export function ChatMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-[15px] leading-relaxed">
      {lines.map((line, i) => {
        if (line.trim() === "") return <div key={i} className="h-1.5" />;
        const ordered = /^\d+\.\s/.test(line.trim());
        const bullet = /^[-*]\s/.test(line.trim());
        const text = ordered || bullet ? line.trim().replace(/^(\d+\.|[-*])\s/, "") : line;
        const inner = renderInline(text);
        if (ordered || bullet) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-0.5 select-none text-accent">{ordered ? line.trim().match(/^\d+/)?.[0] + "." : "•"}</span>
              <span>{inner}</span>
            </div>
          );
        }
        return <p key={i}>{inner}</p>;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded-md bg-surface-soft px-1.5 py-0.5 font-mono text-[13px] text-accent">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
