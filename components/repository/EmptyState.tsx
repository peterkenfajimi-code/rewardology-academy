type Props = {
  heading: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
};

export function EmptyState({ heading, body, ctaLabel, onCta }: Props) {
  return (
    <div className="benefits-repo-empty">
      <div className="benefits-repo-empty-mark" aria-hidden="true">
        ◇
      </div>
      <h2>{heading}</h2>
      <p>{body}</p>
      {ctaLabel ? (
        <button type="button" className="benefits-repo-empty-cta" onClick={onCta}>
          {ctaLabel}
        </button>
      ) : null}
    </div>
  );
}
