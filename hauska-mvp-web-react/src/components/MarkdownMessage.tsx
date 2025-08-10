import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Components } from "react-markdown";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const code = String(children).replace(/\n$/, "");

      if (className && match) {
        return (
          <div className="relative group">
            <button
              onClick={() => handleCopyCode(code)}
              className="absolute right-2 top-2 p-1 rounded-sm bg-slate-700/50 hover:bg-slate-700/70 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy code"
            >
              {copiedCode === code ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-slate-300" />
              )}
            </button>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              customStyle={{
                margin: 0,
                borderRadius: "0.5rem",
                padding: "1rem",
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code
          className={cn(
            "bg-slate-200 dark:bg-slate-800 rounded px-1 py-0.5",
            className
          )}
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  return (
    <div className={cn("prose dark:prose-invert max-w-none", className)}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
