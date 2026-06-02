type PortableTextSpan = {
  _type?: string;
  text?: string;
};

type PortableTextBlock = {
  _type?: string;
  children?: PortableTextSpan[];
};

export function portableTextToPlainText(body: PortableTextBlock[] = []): string {
  return body
    .filter((block) => block?._type === "block" && Array.isArray(block.children))
    .map((block) =>
      (block.children ?? [])
        .filter((child) => child?._type === "span" && typeof child.text === "string")
        .map((child) => child.text)
        .join("")
    )
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
