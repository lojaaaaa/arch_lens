import type { Components } from 'react-markdown';

export const canvasNotesMarkdownComponents: Components = {
    h1: ({ children }) => (
        <h1 className="mb-1 mt-0 text-base font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
        <h2 className="mb-1 mt-2 text-sm font-semibold">{children}</h2>
    ),
    h3: ({ children }) => (
        <h3 className="mb-1 mt-1.5 text-sm font-medium">{children}</h3>
    ),
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
        >
            {children}
        </a>
    ),
    ul: ({ children }) => (
        <ul className="my-1 list-disc pl-4 [&>li]:my-0.5">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="my-1 list-decimal pl-4 [&>li]:my-0.5">{children}</ol>
    ),
    p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
    code: ({ children }) => (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            {children}
        </code>
    ),
};
