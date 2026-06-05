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
              <div className="proof-stars">★★★★★</div>
              <div className="proof-text">&ldquo;{p.quote}&rdquo;</div>
              <div className="proof-author">
                <div className="proof-avatar" style={{ background: p.avatarBg }}>
                  {p.avatar}
                </div>
                <div>
                  <div className="proof-name">{p.name}</div>
                  <div className="proof-role">
                    {p.role} · {p.location}
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
