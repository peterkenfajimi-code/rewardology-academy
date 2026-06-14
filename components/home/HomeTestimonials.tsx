import { HOME_TESTIMONIALS } from "@/lib/home/testimonials";

export function HomeTestimonials() {
  return (
    <section className="section proof-section">
      <div className="section-inner">
        <div className="section-hd reveal">
          <div>
            <div className="section-eyebrow">Testimonials</div>
            <h2 className="section-title">
              Trusted by HR <em>Professionals</em>
            </h2>
            <p className="section-sub" style={{ marginTop: 12, maxWidth: 520 }}>
              Curated perspectives from rewards and HR practitioners across Africa — shared to
              reflect how learners use Rewardology Academy in real careers.
            </p>
          </div>
        </div>
        <div className="proof-grid">
          {HOME_TESTIMONIALS.map((p) => (
            <div className={`proof-card reveal ${p.revealDelay}`} key={p.id}>
              <div className="proof-stars" aria-hidden={!p.quote}>
                {p.quote ? "★★★★★" : "\u00A0"}
              </div>
              <div className="proof-text">{p.quote ? `\u201C${p.quote}\u201D` : "\u00A0"}</div>
              <div className="proof-author">
                <div className="proof-avatar" style={{ background: p.avatarBg }}>
                  {p.avatar || "\u00A0"}
                </div>
                <div>
                  <div className="proof-name">{p.name || "\u00A0"}</div>
                  <div className="proof-role">
                    {[p.role, p.location].filter(Boolean).join(" · ") || "\u00A0"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
