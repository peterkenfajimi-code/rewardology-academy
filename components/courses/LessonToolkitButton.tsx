import { TOOLKIT_MAP, TOOLKIT_HTML_PATH } from "@/lib/toolkit/toolkitMap";

type Props = {
  lessonId: string;
};

export function LessonToolkitButton({ lessonId }: Props) {
  const kit = TOOLKIT_MAP[lessonId];
  if (!kit) return null;

  const url = `${TOOLKIT_HTML_PATH}#${kit.toolId}`;

  return (
    <div className="toolkit-cta">
      <div className="toolkit-cta-eyebrow">Practitioner Toolkit</div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="toolkit-cta-btn">
        <span className="toolkit-icon" aria-hidden>
          🛠
        </span>
        {kit.label}
        <span className="toolkit-arrow" aria-hidden>
          ↗
        </span>
      </a>
      <div className="toolkit-cta-sub">
        Opens in a new tab · Works offline once loaded · Free for all learners
      </div>
    </div>
  );
}
