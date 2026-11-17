import sanitizeHtml from "sanitize-html";
import { summaryToHtml } from "./richtext";

/** Only the formatting the summary editor can produce. Everything else is stripped. */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    b: "strong",
    i: "em",
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length,
};

// target/rel are added by transformTags, so allow them on output.
const OUTPUT: sanitizeHtml.IOptions = { ...OPTIONS, allowedAttributes: { a: ["href", "target", "rel"] } };

/** Clean HTML for storing or rendering. Accepts legacy plain text too. */
export function sanitizeSummary(input: string): string {
  return sanitizeHtml(summaryToHtml(input || ""), OUTPUT);
}
