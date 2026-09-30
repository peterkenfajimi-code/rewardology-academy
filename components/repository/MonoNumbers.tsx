const NUMBER_PATTERN = /((?<![A-Za-z])\d[\d,]*(?:\.\d+)?%?)/g;

export function MonoNumbers({ text }: { text: string }) {
  const parts = text.split(NUMBER_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="benefits-repo-mono">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
