import katex from "katex";

// Renders a LaTeX string to HTML server-side using KaTeX. Runs in a Server
// Component so there is no client JS overhead. The KaTeX stylesheet is loaded
// via next/head in the root layout.

type Props = {
  children: string;
  displayMode?: boolean;
  className?: string;
};

export function LatexBlock({
  children,
  displayMode = true,
  className = "",
}: Props) {
  let html: string;
  try {
    html = katex.renderToString(children, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      output: "html",
    });
  } catch {
    // Fall back to plain text if KaTeX can't parse it at all.
    html = `<span>${children}</span>`;
  }

  return (
    <div
      className={`katex-wrapper overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
