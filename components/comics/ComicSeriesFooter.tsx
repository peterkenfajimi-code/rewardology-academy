import Link from "next/link";
import { COMIC_SERIES } from "@/lib/comics/comicData";

export function ComicSeriesFooter() {
  return (
    <div className="cm-footer-banner">
      <div className="cm-footer-inner">
        <div className="cm-burst">New Episodes Monthly!</div>
        <div className="cm-footer-text">
          Follow the Series. Share the Impact.
          <span>{COMIC_SERIES.footerTagline}</span>
        </div>
        <div className="cm-next-box">Next Issue: {COMIC_SERIES.nextTeaser}</div>
      </div>
    </div>
  );
}
