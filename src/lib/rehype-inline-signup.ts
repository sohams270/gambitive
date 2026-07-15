import { signupHtml } from "./signup-html";

// Long-form pieces get the inline signup after the 4th paragraph;
// short news items (fewer than 10 paragraphs) don't — a signup block
// halfway through a 200-word brief would just be clutter.
const MIN_PARAGRAPHS = 10;
const INSERT_AFTER_PARAGRAPH = 4;

export function rehypeInlineSignup() {
  return (tree: { children: Array<{ type: string; tagName?: string; value?: string }> }) => {
    const paragraphIndexes = tree.children
      .map((node, i) => (node.type === "element" && node.tagName === "p" ? i : -1))
      .filter((i) => i !== -1);

    if (paragraphIndexes.length < MIN_PARAGRAPHS) return;

    tree.children.splice(paragraphIndexes[INSERT_AFTER_PARAGRAPH - 1] + 1, 0, {
      type: "raw",
      value: signupHtml("inline"),
    });
  };
}
